import { createFileRoute } from "@tanstack/react-router";
import { npcPersonas } from "@/game/npcPersonas";
import { createClient } from "@supabase/supabase-js";

/**
 * Aktualisiert das Langzeitgedächtnis eines NPC nach Ende einer Chat-
 * Session.
 *  - Schreibt eine kurze, vom Modell selbst formulierte Notiz fort
 *    ("Was ich über Layard weiß / was beim letzten Treffen passiert
 *    ist") und speichert die letzten ~10 Nachrichten als Frischspeicher.
 *  - Optional: extrahiert 0–2 Flurfunk-Fakten, die der NPC anderen
 *    Bewohnern aus E67 erzählen würde.
 *
 * Auth: User-Token Pflicht. RLS schützt die Tabellen, hier nutzen wir
 * den Service-Client, weil wir bewusst beide Tabellen schreiben.
 */

const RECENT_LIMIT = 10;
const NOTE_MAX_CHARS = 800;

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ALLOWED_NPCS = new Set(Object.keys(npcPersonas));

// Welche NPCs gehören zum Wohnkomplex E67 und können Klatsch hören?
// Hier: alle Personas, die im Spiel im Komplex leben/arbeiten.
const E67_RESIDENTS = Array.from(ALLOWED_NPCS);

// Fire-and-forget Rate-Limit, identisch zu npc-chat aber lockerer:
// Memory-Updates sollen nicht öfter als ~1 pro 10s und User passieren.
const lastUpdate = new Map<string, number>();
const MIN_INTERVAL_MS = 8_000;

export const Route = createFileRoute("/api/public/npc-memory-update")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return json(500, { error: "AI Gateway nicht konfiguriert." });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePub = process.env.SUPABASE_PUBLISHABLE_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabasePub || !serviceKey) {
          return json(500, { error: "Auth nicht konfiguriert." });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        const userToken = authHeader.replace(/^Bearer\s+/i, "");
        if (!userToken) return json(401, { error: "Anmeldung erforderlich." });

        const userClient = createClient(supabaseUrl, supabasePub, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: u, error: authErr } = await userClient.auth.getUser(userToken);
        const uid = u?.user?.id;
        if (authErr || !uid) return json(401, { error: "Ungültiges Token." });

        const now = Date.now();
        const last = lastUpdate.get(uid) ?? 0;
        if (now - last < MIN_INTERVAL_MS) {
          return json(200, { ok: true, throttled: true });
        }
        lastUpdate.set(uid, now);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON" });
        }
        const b = body as {
          npcId?: unknown;
          sessionMessages?: unknown;
        };

        const npcId = typeof b.npcId === "string" ? b.npcId : "";
        if (!ALLOWED_NPCS.has(npcId)) {
          return json(400, { error: "Invalid npcId" });
        }

        const raw = Array.isArray(b.sessionMessages) ? b.sessionMessages : [];
        if (raw.length < 2 || raw.length > 80) {
          // Zu kurz lohnt sich nicht, zu lang ignorieren.
          return json(200, { ok: true, skipped: true });
        }
        const sessionMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
        for (const m of raw) {
          const mm = m as { role?: unknown; content?: unknown };
          if (mm.role !== "user" && mm.role !== "assistant") {
            return json(400, { error: "Invalid role" });
          }
          if (
            typeof mm.content !== "string" ||
            mm.content.length < 1 ||
            mm.content.length > 2000
          ) {
            return json(400, { error: "Invalid content" });
          }
          sessionMessages.push({ role: mm.role, content: mm.content });
        }

        const persona = npcPersonas[npcId];

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Bestehende Notiz laden (falls vorhanden).
        const { data: existing } = await admin
          .from("npc_memory")
          .select("note")
          .eq("user_id", uid)
          .eq("npc_id", npcId)
          .maybeSingle();
        const previousNote = existing?.note ?? "";

        const transcript = sessionMessages
          .map(
            (m) =>
              `${m.role === "user" ? "LAYARD" : persona.displayName.toUpperCase()}: ${m.content}`,
          )
          .join("\n");

        // Andere E67-Bewohner als möglicher Flurfunk-Adressat.
        const otherResidents = E67_RESIDENTS.filter((id) => id !== npcId);

        const sysPrompt =
          `Du bist ein interner Erinnerungs-Assistent für die Spielfigur ${persona.displayName} ` +
          `(NPC-ID: ${npcId}) im Wohnkomplex E67. Du fasst nüchtern zusammen, was diese Figur ` +
          `aus dem letzten Gespräch mit ihrem Nachbarn Layard Worag mitnimmt.\n\n` +
          `Du gibst zwei Dinge aus:\n` +
          `1. note (max ${NOTE_MAX_CHARS} Zeichen, Deutsch, in dritter Person aus Sicht von ${persona.displayName}): ` +
          `eine fortgeschriebene Notiz "Was ich über Layard weiß und was zuletzt passiert ist". ` +
          `Behalte die wichtigsten alten Punkte und ergänze Neues. Keine Liste, fließender Text.\n` +
          `2. gossip (0–2 Einträge): Dinge, die ${persona.displayName} ihren Nachbarn ` +
          `tatsächlich beim nächsten Treffen erzählen würde — also nur, wenn sie wirklich ` +
          `auffällig, klatsch-würdig oder warnend sind. Banales weglassen. ` +
          `Jeder Eintrag enthält "fact" (1 kurzer Satz, Deutsch) und "subjects" ` +
          `(Liste von NPC-IDs aus: ${otherResidents.join(", ")}), an die diese Person den Klatsch weitergeben würde.\n\n` +
          `Bisherige Notiz:\n${previousNote || "(noch keine)"}\n\n` +
          `Letztes Gespräch:\n${transcript}`;

        let upstream: Response;
        try {
          upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: sysPrompt },
                  {
                    role: "user",
                    content:
                      "Erstelle die aktualisierte Notiz und ggf. Flurfunk-Einträge.",
                  },
                ],
                tools: [
                  {
                    type: "function",
                    function: {
                      name: "save_memory",
                      description:
                        "Speichert die fortgeschriebene Notiz und optionale Flurfunk-Fakten.",
                      parameters: {
                        type: "object",
                        properties: {
                          note: { type: "string", maxLength: NOTE_MAX_CHARS },
                          gossip: {
                            type: "array",
                            maxItems: 2,
                            items: {
                              type: "object",
                              properties: {
                                fact: { type: "string", maxLength: 240 },
                                subjects: {
                                  type: "array",
                                  items: { type: "string" },
                                  maxItems: 8,
                                },
                              },
                              required: ["fact", "subjects"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["note", "gossip"],
                        additionalProperties: false,
                      },
                    },
                  },
                ],
                tool_choice: {
                  type: "function",
                  function: { name: "save_memory" },
                },
                temperature: 0.4,
                max_tokens: 1200,
              }),
            },
          );
        } catch (e) {
          console.error("npc-memory-update fetch failed", e);
          return json(502, { error: "Upstream nicht erreichbar." });
        }

        if (!upstream.ok) {
          console.error("npc-memory-update gateway error", upstream.status);
          return json(200, { ok: false, status: upstream.status });
        }

        let data: {
          choices?: Array<{
            message?: {
              tool_calls?: Array<{
                function?: { name?: string; arguments?: string };
              }>;
            };
          }>;
        };
        try {
          data = (await upstream.json()) as typeof data;
        } catch {
          return json(200, { ok: false });
        }

        const call = data.choices?.[0]?.message?.tool_calls?.[0]?.function;
        if (!call?.arguments) return json(200, { ok: false });

        let parsed: { note?: string; gossip?: Array<{ fact?: string; subjects?: string[] }> };
        try {
          parsed = JSON.parse(call.arguments);
        } catch {
          return json(200, { ok: false });
        }

        const note = (parsed.note ?? "").slice(0, NOTE_MAX_CHARS).trim();
        const recent = sessionMessages.slice(-RECENT_LIMIT);

        if (note) {
          await admin
            .from("npc_memory")
            .upsert(
              {
                user_id: uid,
                npc_id: npcId,
                note,
                recent_messages: recent,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,npc_id" },
            );
        }

        // Flurfunk: nur an erlaubte NPC-IDs aus E67 (ohne Quelle selbst).
        const validSubjects = new Set(otherResidents);
        const gossipRows: Array<{
          user_id: string;
          source_npc_id: string;
          subjects: string[];
          fact: string;
        }> = [];
        for (const g of parsed.gossip ?? []) {
          const fact = (g?.fact ?? "").trim();
          if (!fact || fact.length > 240) continue;
          const subjects = (g?.subjects ?? []).filter((s) => validSubjects.has(s));
          if (subjects.length === 0) continue;
          gossipRows.push({
            user_id: uid,
            source_npc_id: npcId,
            subjects,
            fact,
          });
        }
        if (gossipRows.length > 0) {
          await admin.from("npc_gossip").insert(gossipRows);
        }

        return json(200, { ok: true });
      },
    },
  },
});