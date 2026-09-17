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
export const AI_MODEL_MAIN = "anthropic/claude-haiku-4.5";

/**
 * Leichteres Modell für Hintergrund-Aufgaben (z. B. MARV-Empathie-
 * Rater, Klassifikation, kurze Zusammenfassungen) — soll nur Credits
 * sparen, nie sichtbar mit Spielern reden. Läuft über Lovable AI
 * Gateway, weil Anthropic-Modelle dort nicht verfügbar sind.
 */
export const AI_MODEL_LIGHT = "google/gemini-3.1-flash-lite";

/**
 * DSA-Meister läuft über OpenRouter mit OpenAI GPT-5.6 Luna
 * (schnell und ~5x günstiger als Claude Haiku 4.5 bei vergleichbarem
 * Erzähl-/Tool-Verhalten).
 * API-Key liegt in der Umgebungsvariable OPENROUTER_API_KEY.
 */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_CHAT_URL = `${OPENROUTER_BASE_URL}/chat/completions`;
export const AI_MODEL_DSA_MASTER = "openai/gpt-5.6-luna";

/**
 * Gratis-Modell für alle, die (noch) nicht unterstützen. Deutlich
 * günstiger als Luna und für Schnupper-Runden völlig ausreichend.
 */
export const AI_MODEL_DSA_FREE = "google/gemini-3.1-flash-lite";

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

/**
 * Auswählbare Master-Modelle für DSA. Modelle mit donorOnly=true
 * (donation_unlocked=true) dürfen vom Default abweichen — Standard-
 * spieler*innen können alle nicht-donorOnly-Optionen wählen.
 *
 * Reihenfolge bestimmt die Anzeige im UI-Switcher.
 */
export interface DsaMasterModelOption {
  id: string;
  label: string;
  short: string;
  hint: string;
  donorOnly: boolean;
}

export const DSA_MASTER_MODELS: DsaMasterModelOption[] = [
  {
    id: AI_MODEL_DSA_MASTER, // openai/gpt-5.6-luna
    label: "GPT-5.6 Luna (Standard für Unterstützer*innen)",
    short: "Luna",
    hint: "Schnell, gutes Deutsch, solide Tool-Calls.",
    donorOnly: true,
  },
  {
    id: AI_MODEL_DSA_FREE, // google/gemini-3.1-flash-lite
    label: "Gemini 3.1 Flash Lite (Gratis-Standard)",
    short: "Flash Lite",
    hint: "Schnellste, günstigste Option — Standard ohne Unterstützung.",
    donorOnly: false,
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    short: "Haiku",
    hint: "Sehr atmosphärische Erzählung, deutlich teurer.",
    donorOnly: true,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 mini",
    short: "GPT-5.4m",
    hint: "Sehr zuverlässige Tool-Calls, solides Deutsch.",
    donorOnly: true,
  },
  {
    id: "anthropic/claude-sonnet-4",
    label: "Claude Sonnet 4 (Premium)",
    short: "Sonnet 4",
    hint: "Beste DSA-Treue & Erzählkunst — teurer, lohnt sich für Highlights.",
    donorOnly: true,
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek Chat",
    short: "DeepSeek",
    hint: "Sehr günstig, kreatives Storytelling.",
    donorOnly: true,
  },
];

const DSA_MODEL_IDS = new Set(DSA_MASTER_MODELS.map((m) => m.id));

/**
 * Wählt das tatsächlich zu verwendende Modell für eine Anfrage aus.
 * - Nicht-Spender: immer das günstige Gratis-Modell (AI_MODEL_DSA_FREE).
 * - Spender (donor=true): freie Wahl aus der Allowlist, Default Luna.
 */
export function resolveDsaMasterModel(
  requested: unknown,
  donor: boolean,
): string {
  if (!donor) return AI_MODEL_DSA_FREE;
  if (typeof requested !== "string" || !DSA_MODEL_IDS.has(requested)) {
    return AI_MODEL_DSA_MASTER;
  }
  return requested;
}

/**
 * Pro-Modell-Limits für DSA-Meister-Calls. Senkt bei teuren Modellen
 * (Sonnet 4) systematisch die Kostenstellen, ohne den Default für Haiku
 * zu verändern:
 *   - max_tokens (Output)
 *   - historyWindow (Anzahl mitgesendeter Chat-Nachrichten)
 *   - maxToolRounds (dsaLore-Loop-Tiefe)
 *   - useTools (dsaLore überhaupt anbieten)
 */
export interface ModelLimits {
  maxTokens: number;
  historyWindow: number;
  maxToolRounds: number;
  useTools: boolean;
  /** Nur GPT-5.6-Modelle: müssen mit reasoning_effort "none" laufen,
   *  sonst werden Requests mit Function-Tools mit 400 abgelehnt. */
  reasoningEffort?: "none";
}

const DEFAULT_LIMITS: ModelLimits = {
  maxTokens: 950,
  historyWindow: 6,
  maxToolRounds: 4,
  useTools: true,
};

const MODEL_LIMITS_MAP: Record<string, Partial<ModelLimits>> = {
  // Premium-Modell — pro Token am teuersten, also am stärksten gedrosselt.
  "anthropic/claude-sonnet-4": {
    maxTokens: 600,
    historyWindow: 6,
    maxToolRounds: 3,
    useTools: true,
  },
  // Default-Modell — günstigste schnelle Option, reasoning_effort "none"
  // ist bei GPT-5.6 mit Tools Pflicht.
  "openai/gpt-5.6-luna": {
    maxTokens: 800,
    historyWindow: 6,
    maxToolRounds: 4,
    useTools: true,
    reasoningEffort: "none",
  },
  // Wählbare Alternative — teurer, dafür sehr atmosphärisch.
  "anthropic/claude-haiku-4.5": {
    maxTokens: 950,
    historyWindow: 6,
    maxToolRounds: 4,
    useTools: true,
  },
  // Donor-Modelle: kleineres History-Fenster spart ~30 % Prompt-Tokens
  // ohne sichtbaren Erzähl-Bruch (Kurz-Summary im System-Prompt bleibt).
  "openai/gpt-5.4-mini": {
    maxTokens: 700,
    historyWindow: 6,
    maxToolRounds: 3,
    useTools: true,
  },
  "deepseek/deepseek-chat": {
    maxTokens: 700,
    historyWindow: 6,
    maxToolRounds: 3,
    useTools: true,
  },
  "google/gemini-3.1-flash-lite": {
    maxTokens: 700,
    historyWindow: 6,
    maxToolRounds: 3,
    useTools: true,
  },
};

export function getModelLimits(model: string): ModelLimits {
  return { ...DEFAULT_LIMITS, ...(MODEL_LIMITS_MAP[model] ?? {}) };
}