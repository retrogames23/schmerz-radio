/**
 * Zentrale Modell-Wahl. Haupt-Modell und DSA-Meister laufen über
 * OpenRouter (Anthropic), Hintergrund-Aufgaben über den Lovable AI
 * Gateway (Google), weil Anthropic-Modelle dort nicht verfügbar sind.
 *
 * Wenn ein neues, besseres Modell freigegeben wird, hier EINE Zeile
 * tauschen — Free Chat, DSA-Solo, DSA-Gruppe, NPC-Chat etc. ziehen
 * automatisch nach.
 *
 * Auswahlkriterien (Stand: Aug 2026):
 * - schnell genug für Live-Chat (Spieler tippen, Meister antwortet)
 * - günstig im Token-Verbrauch (viele Nachrichten pro Session)
 * - gutes, realistisches Rollenspiel-Gefühl (Aventurien-Flair,
 *   konsistente NSCs, saubere Regel-Marker)
 */

/** Haupt-Modell für Meister/NSC-Antworten, Free Chat, DSA.
 *  Läuft über OpenRouter (OPENROUTER_API_KEY). */
export const AI_MODEL_MAIN = "openai/gpt-6-luna";

/**
 * Leichteres Modell für Hintergrund-Aufgaben (z. B. MARV-Empathie-
 * Rater, Klassifikation, kurze Zusammenfassungen) — soll nur Credits
 * sparen, nie sichtbar mit Spielern reden. Läuft über Lovable AI
 * Gateway, weil Anthropic-Modelle dort nicht verfügbar sind.
 */
export const AI_MODEL_LIGHT = "google/gemini-3.1-flash-lite";

/**
 * DSA-Meister läuft für alle Spieler*innen über OpenRouter mit
 * OpenAI GPT-6 Luna. Gratis und Unterstützung unterscheiden sich nur
 * über Runden-/Abenteuerlimits, nicht über das Modell.
 * API-Key liegt in der Umgebungsvariable OPENROUTER_API_KEY.
 */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_CHAT_URL = `${OPENROUTER_BASE_URL}/chat/completions`;
export const AI_MODEL_DSA_MASTER = "openai/gpt-6-luna";

/**
 * Unsichtbarer Notfall-Ersatz für genau einen Zug, falls Luna ausfällt
 * (502/Timeout). Wird nie regulär gewählt.
 */
export const AI_MODEL_DSA_FALLBACK = "google/gemini-3.1-flash-lite";

/** App-Identifikation für OpenRouter-Ranking-Header (optional aber empfohlen). */
const OPENROUTER_APP_URL = "https://schmerz-radio.com";
const OPENROUTER_APP_TITLE = "Schmerz-Radio";

export function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_APP_URL,
    "X-Title": OPENROUTER_APP_TITLE,
  };
}

/** Ein einziges Meister-Modell für alle; Parameter bleiben für Aufrufer kompatibel. */
export function resolveDsaMasterModel(_requested?: unknown, _donor?: boolean): string {
  return AI_MODEL_DSA_MASTER;
}

/**
 * Pro-Modell-Limits für DSA-Meister-Calls.
 */
export interface ModelLimits {
  maxTokens: number;
  historyWindow: number;
  maxToolRounds: number;
  useTools: boolean;
  /** Luna-Modelle müssen mit Tools reasoning_effort "none" nutzen. */
  reasoningEffort?: "none";
}

const DEFAULT_LIMITS: ModelLimits = {
  maxTokens: 800,
  historyWindow: 6,
  maxToolRounds: 4,
  useTools: true,
};

const MODEL_LIMITS_MAP: Record<string, Partial<ModelLimits>> = {
  [AI_MODEL_DSA_MASTER]: { reasoningEffort: "none" },
  [AI_MODEL_DSA_FALLBACK]: { maxTokens: 700, maxToolRounds: 2 },
};

export function getModelLimits(model: string): ModelLimits {
  return { ...DEFAULT_LIMITS, ...(MODEL_LIMITS_MAP[model] ?? {}) };
}