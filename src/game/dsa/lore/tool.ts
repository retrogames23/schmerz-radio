/**
 * Tool-Definition + Loop-Runner für `dsaLore`. Wird von beiden Master-
 * Routes (solo + group) verwendet, damit der LLM-Meister Detail-Lore
 * (Anreden, Götter, Regionen, Zauber, Waffen, …) on demand nachschlagen
 * kann, statt sie immer im System-Prompt mitzuschleppen.
 */

import { resolveLoreTopic, LORE_TOPIC_HINT } from "./lookup";
import {
  AI_MODEL_DSA_MASTER,
  OPENROUTER_CHAT_URL,
  openRouterHeaders,
} from "@/lib/aiModel";

export const DSA_LORE_TOOL_SPEC = {
  type: "function" as const,
  function: {
    name: "dsaLore",
    description:
      "Schlägt aventurisches Detailwissen nach (Anreden, Götter, Regionen, Zauber, Waffen, Rüstungen, Talente, Monster, Welt-Kontext, Gefährten-Backstories). " +
      "Ruf das Tool auf, BEVOR du eine Aussage triffst, bei der du unsicher bist — speziell bei Titeln/Anreden, Geografie, Götter-Details, Zeitrechnung/Jahresdifferenzen oder Spielregeln. " +
      "Budget: maximal 1–2 Aufrufe pro Meisterwende. Danach erzähle, auch wenn du noch unsicher bist — lieber generisch beschreiben als die Wende verbrennen. " +
      LORE_TOPIC_HINT,
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "Genau eines der erlaubten Topics, z. B. 'anreden.klerus', 'region.greifenfurt', 'gott.praios', 'zauber.fulminictus', 'zeitrechnung.bf.2027'. Bei Unsicherheit zuerst 'liste.*' bzw. 'zeitrechnung' aufrufen.",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
};

/** Default-Max. Tool-Roundtrips pro Meisterwende — schützt vor Endlosschleifen.
 *  Aufrufer können den Wert pro Modell drücken (siehe getModelLimits). */
const DEFAULT_MAX_TOOL_ROUNDS = 4;

type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "system";
      content: Array<{
        type: "text";
        text: string;
        cache_control?: { type: "ephemeral" };
      }>;
    }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

/**
 * Führt einen Chat-Completion-Call mit dsaLore-Tool-Support aus.
 * Loopt so lange, bis das Modell entweder Text liefert oder
 * MAX_TOOL_ROUNDS erreicht ist.
 */
export async function callChatWithLoreTool(
  apiKey: string,
  messages: ChatMessage[],
  options: {
    temperature: number;
    max_tokens: number;
    model?: string;
    /** Pro-Call-Override für die Tool-Loop-Tiefe. */
    maxToolRounds?: number;
    /** false → `tools`/`tool_choice` weglassen; spart bei großen Modellen
     *  einen vollen Prompt-Roundtrip, wenn das Modell die Lore eh kennt. */
    useTools?: boolean;
    /** Optionales Telemetrie-Label fürs Log (z. B. "master:say"). */
    callLabel?: string;
  },
): Promise<
  | { ok: true; reply: string }
  | { ok: false; status: number; error: string }
> {
  const working: ChatMessage[] = [...messages];
  const model = options.model || AI_MODEL_DSA_MASTER;
  const maxRounds = Math.max(1, options.maxToolRounds ?? DEFAULT_MAX_TOOL_ROUNDS);
  const useTools = options.useTools !== false;
  const label = options.callLabel ?? "dsa-master";

  for (let round = 0; round < maxRounds; round++) {
    let upstream: Response;
    try {
      upstream = await fetch(OPENROUTER_CHAT_URL, {
        method: "POST",
        headers: openRouterHeaders(apiKey),
        body: JSON.stringify({
          model,
          messages: working,
          ...(useTools
            ? { tools: [DSA_LORE_TOOL_SPEC], tool_choice: "auto" as const }
            : {}),
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          stream: false,
        }),
      });
    } catch (e) {
      console.error("dsaLore fetch failed", e);
      return { ok: false, status: 502, error: "Upstream nicht erreichbar." };
    }
    if (!upstream.ok) {
      const status = upstream.status;
      console.error("dsaLore upstream error", status);
      if (status === 429) return { ok: false, status: 429, error: "Rate limited" };
      if (status === 402) return { ok: false, status: 402, error: "AI-Kontingent erschöpft." };
      return { ok: false, status: 502, error: "AI-Dienst antwortet nicht." };
    }
    let data: {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            id: string;
            type: "function";
            function: { name: string; arguments: string };
          }>;
        };
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        prompt_tokens_details?: { cached_tokens?: number };
        cache_creation_input_tokens?: number;
        cache_read_input_tokens?: number;
      };
    };
    try {
      data = (await upstream.json()) as typeof data;
    } catch {
      return { ok: false, status: 502, error: "Ungültige Antwort vom AI-Dienst." };
    }
    const msg = data.choices?.[0]?.message;
    const toolCalls = msg?.tool_calls;
    const content = (msg?.content ?? "").trim();

    // Kosten-Telemetrie pro Roundtrip — landet im Worker-Log.
    try {
      const u = data.usage ?? {};
      console.log(
        `[dsa-cost] ${JSON.stringify({
          label,
          model,
          round,
          maxRounds,
          useTools,
          prompt: u.prompt_tokens ?? null,
          completion: u.completion_tokens ?? null,
          cached: u.prompt_tokens_details?.cached_tokens ?? u.cache_read_input_tokens ?? null,
          cacheCreate: u.cache_creation_input_tokens ?? null,
          toolCall: toolCalls?.length ?? 0,
        })}`,
      );
    } catch {
      /* logging never fails the call */
    }

    if (useTools && toolCalls && toolCalls.length > 0) {
      // Assistant-Nachricht mit tool_calls anhängen (content darf leer/null sein).
      working.push({
        role: "assistant",
        content: msg?.content ?? "",
        tool_calls: toolCalls,
      });
      for (const tc of toolCalls) {
        let topic = "";
        try {
          const parsed = JSON.parse(tc.function.arguments || "{}") as { topic?: unknown };
          topic = typeof parsed.topic === "string" ? parsed.topic : "";
        } catch {
          topic = "";
        }
        const result =
          tc.function.name === "dsaLore" && topic
            ? resolveLoreTopic(topic)
            : `Unbekanntes Tool oder fehlendes Argument 'topic'. Erlaubt: dsaLore({ topic: '<…>' }).`;
        working.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result.slice(0, 4000),
        });
      }
      continue; // Nächste Runde: Modell antwortet auf Tool-Ergebnis.
    }

    if (!content) {
      return { ok: false, status: 502, error: "Leere Antwort." };
    }
    return { ok: true, reply: content };
  }

  return {
    ok: false,
    status: 502,
    error: "Zu viele dsaLore-Aufrufe ohne Antwort.",
  };
}