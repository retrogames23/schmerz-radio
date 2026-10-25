import { createFileRoute } from "@tanstack/react-router";
import {
  OPENROUTER_CHAT_URL,
  openRouterHeaders,
} from "@/lib/aiModel";

/** Auskunft läuft über das günstige Luna-Modell — kurze Faktenantworten
 *  brauchen kein Premium-Modell. GPT-5.6 braucht reasoning_effort
 *  "none", sonst werden Requests abgelehnt. */
const AUSKUNFT_MODEL = "openai/gpt-6-luna";
import {
  AUSKUNFT_SYSTEM_PROMPT,
  AUSKUNFT_TRANSFER_RULES,
  stationSystemPrompt,
} from "@/game/auskunftPrompt";

/**
 * `auskunft.bin` — amtliches Auskunftssystem im Terminal.
 * Schutz: Origin-Guard, Per-IP-Rate-Limit, harte Längenbegrenzungen.
 * Kein Chat-Inhalt wird geloggt.
 */

const RATE_WINDOW_MIN_MS = 60_000;
const RATE_MAX_MIN = 15;
const RATE_WINDOW_HOUR_MS = 60 * 60_000;
const RATE_MAX_HOUR = 120;

const ipMin = new Map<string, number[]>();
const ipHour = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const m = (ipMin.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MIN_MS);
  const h = (ipHour.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_HOUR_MS);
  if (m.length >= RATE_MAX_MIN || h.length >= RATE_MAX_HOUR) {
    ipMin.set(ip, m);
    ipHour.set(ip, h);
    return true;
  }
  m.push(now);
  h.push(now);
  ipMin.set(ip, m);
  ipHour.set(ip, h);
  return false;
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Entfernt Steuerzeichen und die üblichen Prompt-Injection-Phrasen. */
function sanitize(input: unknown, maxLen: number): string {
  let s = typeof input === "string" ? input : "";
  s = s.replace(/[\u0000-\u001F\u007F]+/g, " ");
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
  return s.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

export const Route = createFileRoute("/api/public/auskunft")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['OPENROUTER_API_KEY'];
        if (!apiKey) return json(500, { error: "Auskunft nicht konfiguriert." });

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
              originHost === "www.schmerz-radio.com";
            if (!allowed) return json(403, { error: "Forbidden" });
          } catch {
            return json(403, { error: "Forbidden" });
          }
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) {
          return json(429, { error: "Anfragekontingent erschöpft." });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON" });
        }
        const b = body as { question?: unknown; history?: unknown; station?: unknown };
        const question = sanitize(b.question, 600);
        if (question.length < 1) return json(400, { error: "Leere Anfrage." });
        const station = sanitize(b.station, 80);
        const systemPrompt = station
          ? stationSystemPrompt(station)
          : AUSKUNFT_SYSTEM_PROMPT + AUSKUNFT_TRANSFER_RULES;

        const history = Array.isArray(b.history)
          ? b.history
              .slice(-8)
              .map((m) => {
                const e = m as { role?: unknown; content?: unknown };
                const role = e.role === "assistant" ? "assistant" : "user";
                return { role, content: sanitize(e.content, 600) };
              })
              .filter((m) => m.content.length > 0)
          : [];

        try {
          const resp = await fetch(OPENROUTER_CHAT_URL, {
            method: "POST",
            headers: openRouterHeaders(apiKey),
            body: JSON.stringify({
              model: AUSKUNFT_MODEL,
              messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: question },
              ],
              reasoning_effort: "none",
              temperature: 0.3,
              max_tokens: 320,
              stream: false,
            }),
          });
          if (!resp.ok) {
            return json(502, { error: "Auskunftsdienst nicht erreichbar." });
          }
          const data = (await resp.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const answer = data.choices?.[0]?.message?.content?.trim() ?? "";
          if (!answer) return json(502, { error: "Keine Auskunft erhalten." });
          return json(200, { answer });
        } catch {
          return json(502, { error: "Auskunftsdienst nicht erreichbar." });
        }
      },
    },
  },
});
