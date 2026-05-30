import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { buildMasterSystemPrompt } from "@/game/dsa/llmMasterPrompt";
import {
  DSA_SETTINGS,
  getSetting,
  parseMasterTurn,
  type DsaSettingId,
  type StoredTurn,
  type AdventureStatus,
} from "@/game/dsa/llmAdventure";
import type { DsaCharacterSummary } from "@/game/types";

/**
 * LLM-Tafelrunde im Gemeinschaftsraum E67. Eine einzige Route, drei
 * Operationen:
 *   action="load"  → lädt laufendes Abenteuer (oder gibt {none:true}).
 *   action="start" → erzeugt neues Abenteuer, fordert Eröffnungsszene an.
 *   action="say"   → Spielerzug, hängt an Verlauf an, ruft Meister auf.
 *   action="combat_result" → speichert Kampfausgang als System-Zeile und
 *                            fordert eine Reaktion vom Meister an.
 *   action="abort" → markiert Abenteuer als 'aborted' (für späteren Reset).
 */

const HARD_LIMIT = 50;
const MAX_USER_INPUT = 500;
const MAX_MESSAGES = 60;
const SUMMARY_TRIGGER = 50; // ab dieser Länge älteste Hälfte zusammenfassen

const RATE_WINDOW_MIN_MS = 60_000;
const RATE_MAX_MIN = 20;
const ipMin = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipMin.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MIN_MS);
  if (arr.length >= RATE_MAX_MIN) {
    ipMin.set(ip, arr);
    return true;
  }
  arr.push(now);
  ipMin.set(ip, arr);
  return false;
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ALLOWED_SETTINGS = new Set<string>(DSA_SETTINGS.map((s) => s.id));

const VALID_ATTR_KEYS = ["MU", "KL", "CH", "FF", "GE", "IN", "KK"] as const;
type AttrKey = (typeof VALID_ATTR_KEYS)[number];

/**
 * Sanitize attribute keys: only the seven canonical DSA attributes are
 * allowed; values are clamped to 1..20. This prevents prompt injection
 * via crafted attribute names being interpolated into the master system
 * prompt downstream.
 */
function sanitizeAttrs(input: unknown): Record<AttrKey, number> {
  const out = {} as Record<AttrKey, number>;
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  for (const k of VALID_ATTR_KEYS) {
    const v = src[k];
    out[k] =
      typeof v === "number" && Number.isFinite(v)
        ? Math.max(1, Math.min(20, Math.round(v)))
        : 11;
  }
  return out;
}

/**
 * Sanitize free-text character fields (name, className) before they are
 * interpolated into the LLM master system prompt. Strips control chars,
 * line breaks, bracket/markdown noise, and neutralizes common prompt
 * injection phrases like "ignore previous instructions" / "system prompt".
 */
function sanitizePromptField(input: unknown, maxLen: number): string {
  let s = typeof input === "string" ? input : "";
  // Strip control chars + line breaks.
  s = s.replace(/[\u0000-\u001F\u007F]+/g, " ");
  // Strip characters frequently used to break out of a prompt block.
  s = s.replace(/[<>{}\[\]`|\\]/g, " ");
  // Neutralize common jailbreak phrases (DE + EN).
  const phrases = [
    /ignore (all |previous |above )?(instructions|rules|prompts?)/gi,
    /disregard (all |previous |above )?(instructions|rules|prompts?)/gi,
    /(system|developer|assistant)\s*[: ]\s*prompt/gi,
    /ignoriere (alle |vorherigen |obigen )?(anweisungen|regeln|prompts?)/gi,
    /vergiss (alle |alles |vorherige[ns]? )?(anweisungen|regeln|prompts?)/gi,
    /system[- ]?prompt/gi,
    /jailbreak/gi,
  ];
  for (const p of phrases) s = s.replace(p, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.slice(0, maxLen);
}

function isCharacterSummary(value: unknown): value is DsaCharacterSummary {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    typeof c.className === "string" &&
    typeof c.classId === "string" &&
    typeof c.le === "number" &&
    typeof c.leMax === "number" &&
    typeof c.attrs === "object" &&
    c.attrs !== null
  );
}

/** Aktualisiert die Zusammenfassung, wenn der Verlauf zu lang wird. */
async function maybeSummarize(
  apiKey: string,
  prevSummary: string,
  messages: StoredTurn[],
): Promise<{ summary: string; messages: StoredTurn[] }> {
  if (messages.length < SUMMARY_TRIGGER) {
    return { summary: prevSummary, messages };
  }
  // Halbe Länge nach hinten behalten, vordere Hälfte zusammenfassen.
  const cutoff = Math.floor(messages.length / 2);
  const toSummarize = messages.slice(0, cutoff);
  const remaining = messages.slice(cutoff);
  const transcript = toSummarize
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Du fasst einen DSA-Spielabend in 4–8 Stichpunkten auf Deutsch zusammen. Nenne: Setting, wichtige NPCs, getroffene Entscheidungen, gefundene/erlittene Dinge, offene Fäden. Kein Geschwafel, keine Sprecherkürzel.",
          },
          {
            role: "user",
            content: `BISHERIGE ZUSAMMENFASSUNG:\n${prevSummary || "(noch keine)"}\n\nNEUE EREIGNISSE:\n${transcript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 350,
        stream: false,
      }),
    });
    if (!resp.ok) return { summary: prevSummary, messages };
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const newSummary = data.choices?.[0]?.message?.content?.trim() ?? prevSummary;
    return { summary: newSummary, messages: remaining };
  } catch {
    return { summary: prevSummary, messages };
  }
}

/** Hauptaufruf: Meister sprechen lassen. */
async function callMaster(
  apiKey: string,
  systemPrompt: string,
  history: StoredTurn[],
): Promise<{ ok: true; reply: string } | { ok: false; status: number; error: string }> {
  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.8,
        max_tokens: 700,
        stream: false,
      }),
    });
  } catch (e) {
    console.error("dsa-master fetch failed", e);
    return { ok: false, status: 502, error: "Upstream nicht erreichbar." };
  }
  if (!upstream.ok) {
    const status = upstream.status;
    console.error("dsa-master AI Gateway error", status);
    if (status === 429) return { ok: false, status: 429, error: "Rate limited" };
    if (status === 402) return { ok: false, status: 402, error: "AI-Kontingent erschöpft." };
    return { ok: false, status: 502, error: "AI-Dienst antwortet nicht." };
  }
  let data: { choices?: Array<{ message?: { content?: string | null } }> };
  try {
    data = (await upstream.json()) as typeof data;
  } catch {
    return { ok: false, status: 502, error: "Ungültige Antwort vom AI-Dienst." };
  }
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) return { ok: false, status: 502, error: "Leere Antwort." };
  return { ok: true, reply };
}

export const Route = createFileRoute("/api/public/dsa-master")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return json(500, { error: "AI Gateway nicht konfiguriert." });

        // Origin-Guard wie npc-chat
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            const originHost = new URL(origin).host;
            const allowed =
              originHost === request.headers.get("host") ||
              /\.lovable\.app$/.test(originHost) ||
              /\.lovableproject\.com$/.test(originHost) ||
              /\.lovable\.dev$/.test(originHost) ||
              originHost === "localhost" ||
              originHost.startsWith("localhost:") ||
              originHost.startsWith("127.0.0.1") ||
              originHost === "schmerz-radio.com" ||
              originHost === "www.schmerz-radio.com" ||
              originHost === "whisperquest.app" ||
              originHost === "www.whisperquest.app";
            if (!allowed) return json(403, { error: "Forbidden" });
          } catch {
            return json(403, { error: "Forbidden" });
          }
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) return json(429, { error: "Rate limit exceeded" });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePub = process.env.SUPABASE_PUBLISHABLE_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabasePub || !serviceKey) {
          return json(500, { error: "Auth nicht konfiguriert." });
        }
        const authHeader = request.headers.get("authorization") ?? "";
        const userToken = authHeader.replace(/^Bearer\s+/i, "");
        let uid: string | null = null;
        if (userToken) {
          const userClient = createClient(supabaseUrl, supabasePub, {
            global: { headers: { Authorization: `Bearer ${userToken}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: u, error: authErr } = await userClient.auth.getUser(userToken);
          if (authErr || !u?.user?.id) return json(401, { error: "Ungültiges Token." });
          uid = u.user.id;
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON" });
        }
        const b = body as Record<string, unknown>;
        const action = typeof b.action === "string" ? b.action : "";
        // Per-game-instance scope so each save slot / fresh game keeps
        // its own master memory.
        const sessionId = typeof b.sessionId === "string" ? b.sessionId : "";
        if (!/^[0-9a-zA-Z_-]{8,64}$/.test(sessionId)) {
          return json(400, { error: "Ungültige Session-ID." });
        }

        // Anonyme Spieler identifizieren sich über eine stabile, im
        // Browser gespeicherte ID. Genau eines von beidem ist gesetzt.
        const anonIdRaw = typeof b.anonId === "string" ? b.anonId : "";
        const anonId =
          !uid && /^[0-9a-zA-Z_-]{8,64}$/.test(anonIdRaw) ? anonIdRaw : null;
        if (!uid && !anonId) {
          return json(400, { error: "Anonyme ID fehlt." });
        }

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // ── load ──────────────────────────────────────────
        if (action === "load") {
          const q = admin
            .from("dsa_llm_adventures")
            .select("setting, character_snapshot, messages, summary, current_image_tag, status, offtopic_streak");
          const { data: row } = await (uid
            ? q.eq("user_id", uid)
            : q.eq("anon_id", anonId!)
          )
            .eq("session_id", sessionId)
            .maybeSingle();
          if (!row) return json(200, { none: true });
          return json(200, { adventure: row });
        }

        // ── abort ─────────────────────────────────────────
        if (action === "abort") {
          const del = admin
            .from("dsa_llm_adventures")
            .delete();
          await (uid ? del.eq("user_id", uid) : del.eq("anon_id", anonId!))
            .eq("session_id", sessionId);
          return json(200, { ok: true });
        }

        // Angemeldete Spieler verbrauchen Cloud-Requests aus ihrem Profil.
        // Anonyme Spieler bekommen genau ein Abenteuer pro anon_id.
        if (uid) {
          const { data: incRows, error: incErr } = await admin.rpc(
            "try_increment_cloud_request_count",
            { _user_id: uid, _hard_limit: HARD_LIMIT },
          );
          if (incErr || !incRows) return json(500, { error: "Profil nicht gefunden." });
          const incRow = Array.isArray(incRows) ? incRows[0] : incRows;
          if (incRow.limit_reached) {
            return json(402, {
              error:
                "Cloud-Limit erreicht. Bitte unterstütze das Projekt, um weiter chatten zu können.",
              code: "donation_required",
            });
          }
        }

        // ── start ─────────────────────────────────────────
        if (action === "start") {
          // Anonyme: nur ein Abenteuer insgesamt. Existiert bereits eins
          // (egal welcher Status), gibts den Spendenhinweis.
          if (anonId) {
            const { data: existing } = await admin
              .from("dsa_llm_adventures")
              .select("session_id, status")
              .eq("anon_id", anonId)
              .limit(1)
              .maybeSingle();
            if (existing && existing.session_id !== sessionId) {
              return json(402, {
                error:
                  "Dein Schnupper-Abenteuer ist vorbei. Melde dich an und unterstütze das Projekt, um weitere Runden zu spielen.",
                code: "donation_required",
              });
            }
            if (existing && existing.status !== "active") {
              return json(402, {
                error:
                  "Dein Schnupper-Abenteuer ist vorbei. Melde dich an und unterstütze das Projekt, um eine weitere Runde zu spielen.",
                code: "donation_required",
              });
            }
          }
          const settingId = typeof b.setting === "string" ? b.setting : "";
          if (!ALLOWED_SETTINGS.has(settingId)) {
            return json(400, { error: "Unbekanntes Setting." });
          }
          const character = b.character;
          if (!isCharacterSummary(character)) {
            return json(400, { error: "Charakter fehlt oder ungültig." });
          }
          const setting = getSetting(settingId)!;
          const characterSnap: DsaCharacterSummary = {
            name: sanitizePromptField(character.name, 60) || "Namenlos",
            className: sanitizePromptField(character.className, 40) || "Abenteurer",
            classId: String(character.classId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40),
            attrs: sanitizeAttrs(character.attrs),
            le: character.le,
            leMax: character.leMax,
            ae: character.ae,
            rerolled: !!character.rerolled,
          };
          const systemPrompt = buildMasterSystemPrompt({
            setting: settingId as DsaSettingId,
            character: characterSnap,
            summary: "",
            offtopicStreak: 0,
          });
          const opener: StoredTurn = {
            role: "user",
            content:
              "(SPIELLEITER-CUE: Eröffne das Abenteuer. Setze die Szene mit [SCENE: …], beschreibe in 2–4 Sätzen, wo Layards Charakter mit Brem und Yelva steht und was sie umgibt. Schließe mit einer offenen Frage an die Gruppe oder einer ersten Beobachtung. Noch kein Kampf.)",
          };
          const result = await callMaster(apiKey, systemPrompt, [opener]);
          if (!result.ok) return json(result.status, { error: result.error });
          const parsed = parseMasterTurn(result.reply);
          const initialMessages: StoredTurn[] = [
            opener,
            { role: "assistant", content: result.reply },
          ];
          const imgTag = parsed.sceneTag ?? setting.openingTag;
          const savePayload = {
            user_id: uid,
            anon_id: anonId,
            session_id: sessionId,
            setting: settingId,
            character_snapshot: characterSnap as unknown as Record<string, unknown>,
            messages: initialMessages as unknown as Record<string, unknown>[],
            summary: "",
            current_image_tag: imgTag,
            status: "active" as AdventureStatus,
            offtopic_streak: 0,
          };
          const existingQ = admin.from("dsa_llm_adventures").select("id");
          const { data: existingRow, error: existingErr } = await (uid
            ? existingQ.eq("user_id", uid)
            : existingQ.eq("anon_id", anonId!)
          )
            .eq("session_id", sessionId)
            .limit(1)
            .maybeSingle();
          const { error: upErr } = existingRow?.id
            ? await admin
                .from("dsa_llm_adventures")
                .update(savePayload)
                .eq("id", existingRow.id)
            : await admin.from("dsa_llm_adventures").insert(savePayload);
          if (existingErr || upErr) {
            console.error("dsa-master save failed", existingErr ?? upErr);
            return json(500, { error: "Speichern fehlgeschlagen." });
          }
          return json(200, {
            reply: result.reply,
            parsed,
            imageTag: imgTag,
            status: "active",
          });
        }

        // ── say / combat_result ───────────────────────────
        if (action === "say" || action === "combat_result") {
          const baseQ = admin
            .from("dsa_llm_adventures")
            .select("setting, character_snapshot, messages, summary, current_image_tag, status, offtopic_streak");
          const { data: row, error: loadErr } = await (uid
            ? baseQ.eq("user_id", uid)
            : baseQ.eq("anon_id", anonId!)
          )
            .eq("session_id", sessionId)
            .maybeSingle();
          if (loadErr || !row) return json(404, { error: "Kein laufendes Abenteuer." });
          if (row.status !== "active") {
            return json(409, { error: "Abenteuer ist bereits beendet." });
          }

          let newTurn: StoredTurn;
          if (action === "say") {
            const text = typeof b.text === "string" ? b.text.trim() : "";
            if (text.length < 1 || text.length > MAX_USER_INPUT) {
              return json(400, { error: "Ungültige Eingabe." });
            }
            newTurn = { role: "user", content: text };
          } else {
            const outcomeRaw = typeof b.outcome === "string" ? b.outcome : (b.victory ? "victory" : "defeat_consequence");
            const outcome =
              outcomeRaw === "victory" || outcomeRaw === "aborted" || outcomeRaw === "defeat_consequence"
                ? outcomeRaw
                : "defeat_consequence";
            const heroLe = typeof b.heroLe === "number" ? Math.max(0, Math.round(b.heroLe)) : 0;
            const heroLeMax =
              typeof b.heroLeMax === "number" ? Math.max(1, Math.round(b.heroLeMax)) : 1;
            const wounds = typeof b.wounds === "number" ? Math.max(0, Math.min(3, Math.round(b.wounds))) : 0;
            const fallen = Array.isArray(b.fallen)
              ? (b.fallen as unknown[])
                  .filter((x): x is string => typeof x === "string")
                  .slice(0, 6)
              : [];
            const kindRaw = typeof b.consequenceKind === "string" ? b.consequenceKind : "";
            const kind = ["capture", "robbery", "wound", "timeloss"].includes(kindRaw) ? kindRaw : "";
            const attrLowered =
              typeof b.attrLowered === "string" && /^(MU|KL|CH|FF|GE|IN|KK)$/.test(b.attrLowered)
                ? b.attrLowered
                : "";
            const parts = [
              `outcome=${outcome}`,
              `hero_le=${heroLe}/${heroLeMax}`,
              `wounds=${wounds}`,
              `fallen=[${fallen.join(", ")}]`,
            ];
            if (outcome === "defeat_consequence" && kind) parts.push(`kind=${kind}`);
            if (outcome === "defeat_consequence" && kind === "wound" && attrLowered) {
              parts.push(`attr_lowered=${attrLowered}`);
            }
            newTurn = {
              role: "user",
              content: `[COMBAT_RESULT] ${parts.join(" ")}`,
            };
          }

          // Verlauf zusammenstellen, ggf. zusammenfassen.
          const rawMessages = (row.messages ?? []) as StoredTurn[];
          let history: StoredTurn[] = [...rawMessages, newTurn];
          let summary = row.summary ?? "";
          if (history.length > SUMMARY_TRIGGER) {
            const sumResult = await maybeSummarize(apiKey, summary, history);
            summary = sumResult.summary;
            history = sumResult.messages;
          }
          if (history.length > MAX_MESSAGES) {
            history = history.slice(history.length - MAX_MESSAGES);
          }

          const rawSnap = row.character_snapshot as DsaCharacterSummary;
          const characterSnap: DsaCharacterSummary = {
            ...rawSnap,
            attrs: sanitizeAttrs(rawSnap.attrs),
          };
          const settingId = row.setting as DsaSettingId;

          // Offtopic-Heuristik: User-Turn ohne Charakter-/Welt-Bezug zählt.
          let offtopicStreak = row.offtopic_streak ?? 0;
          if (action === "say") {
            const lower = (newTurn.content || "").toLowerCase();
            const meta = /\b(pizza|essen|hunger|wlan|handy|internet|server|tjark|brem|yelva|spiel|regelwerk|kantine|kowalk|mira|insa)\b/.test(
              lower,
            );
            offtopicStreak = meta ? offtopicStreak + 1 : 0;
          } else {
            offtopicStreak = 0;
          }

          const systemPrompt = buildMasterSystemPrompt({
            setting: settingId,
            character: characterSnap,
            summary,
            offtopicStreak,
          });
          const result = await callMaster(apiKey, systemPrompt, history);
          if (!result.ok) return json(result.status, { error: result.error });
          const parsed = parseMasterTurn(result.reply);
          history.push({ role: "assistant", content: result.reply });

          let nextStatus: AdventureStatus = "active";
          if (parsed.end === "victory") nextStatus = "victory";
          else if (parsed.end === "defeat") nextStatus = "defeat";
          else if (parsed.end === "aborted") nextStatus = "aborted";

          const imgTag = parsed.sceneTag ?? row.current_image_tag ?? "forest_path";

          if (parsed.outtimeWarn) offtopicStreak = 0;

          const updateQ = admin
            .from("dsa_llm_adventures")
            .update({
              messages: history as unknown as Record<string, unknown>[],
              summary,
              current_image_tag: imgTag,
              status: nextStatus,
              offtopic_streak: offtopicStreak,
            });
          const { error: upErr } = await (uid
            ? updateQ.eq("user_id", uid)
            : updateQ.eq("anon_id", anonId!)
          )
            .eq("session_id", sessionId);
          if (upErr) {
            console.error("dsa-master update failed", upErr);
            return json(500, { error: "Speichern fehlgeschlagen." });
          }
          return json(200, {
            reply: result.reply,
            parsed,
            imageTag: imgTag,
            status: nextStatus,
          });
        }

        return json(400, { error: "Unbekannte Aktion." });
      },
    },
  },
});