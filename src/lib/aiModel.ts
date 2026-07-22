/**
 * Zentrale Modell-Wahl für Lovable AI Gateway.
 *
 * Wenn Lovable AI ein neues, besseres Modell freigibt, hier EINE Zeile
 * tauschen — Free Chat, DSA-Solo, DSA-Gruppe, NPC-Chat etc. ziehen
 * automatisch nach.
 *
 * Auswahlkriterien (Stand: Juni 2026):
 * - schnell genug für Live-Chat (Spieler tippen, Meister antwortet)
 * - günstig im Credit-Verbrauch (viele Nachrichten pro Session)
 * - gutes, realistisches Rollenspiel-Gefühl (Aventurien-Flair,
 *   konsistente NSCs, saubere Regel-Marker)
 */

/** Haupt-Modell für Meister/NSC-Antworten, Free Chat, DSA. */
export const AI_MODEL_MAIN = "google/gemini-3.6-flash";

/**
 * Leichteres Modell für Hintergrund-Aufgaben (z. B. Memory-Update,
 * Klassifikation, kurze Zusammenfassungen) — soll nur Credits sparen,
 * nie sichtbar mit Spielern reden.
 */
export const AI_MODEL_LIGHT = "google/gemini-2.5-flash-lite";

/**
 * DSA-Meister läuft über OpenRouter mit Anthropic Claude 3.5 Sonnet.
 * API-Key liegt in der Umgebungsvariable OPENROUTER_API_KEY.
 */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_CHAT_URL = `${OPENROUTER_BASE_URL}/chat/completions`;
export const AI_MODEL_DSA_MASTER = "anthropic/claude-3.5-haiku";

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
 * Auswählbare Master-Modelle für DSA. Nur Unterstützer*innen
 * (donation_unlocked=true) dürfen vom Default abweichen — Standard-
 * spieler*innen bleiben zwingend auf AI_MODEL_DSA_MASTER.
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
    id: AI_MODEL_DSA_MASTER, // anthropic/claude-3.5-haiku
    label: "Claude 3.5 Haiku (Standard)",
    short: "Haiku",
    hint: "Atmosphärisch, sehr gutes Deutsch, schnell — die Voreinstellung.",
    donorOnly: false,
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
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    short: "Gemini",
    hint: "Schnell, günstig, solides Deutsch.",
    donorOnly: true,
  },
];

const DSA_MODEL_IDS = new Set(DSA_MASTER_MODELS.map((m) => m.id));

/**
 * Wählt das tatsächlich zu verwendende Modell für eine Anfrage aus.
 * - kein/unbekanntes Modell oder Nicht-Spender mit donorOnly-Wahl
 *   → Fallback auf den Default (AI_MODEL_DSA_MASTER).
 * - Spender (donor=true) dürfen jedes Modell aus der Allowlist nutzen.
 */
export function resolveDsaMasterModel(
  requested: unknown,
  donor: boolean,
): string {
  if (typeof requested !== "string" || !DSA_MODEL_IDS.has(requested)) {
    return AI_MODEL_DSA_MASTER;
  }
  const opt = DSA_MASTER_MODELS.find((m) => m.id === requested)!;
  if (opt.donorOnly && !donor) return AI_MODEL_DSA_MASTER;
  return opt.id;
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
}

const DEFAULT_LIMITS: ModelLimits = {
  maxTokens: 950,
  historyWindow: 10,
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
  // Default-Modell — bleibt großzügig.
  "anthropic/claude-3.5-haiku": {
    maxTokens: 950,
    historyWindow: 10,
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
  "google/gemini-2.5-flash": {
    maxTokens: 700,
    historyWindow: 6,
    maxToolRounds: 3,
    useTools: true,
  },
};

export function getModelLimits(model: string): ModelLimits {
  return { ...DEFAULT_LIMITS, ...(MODEL_LIMITS_MAP[model] ?? {}) };
}