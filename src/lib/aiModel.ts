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
export const AI_MODEL_MAIN = "google/gemini-3-flash-preview";

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
export const AI_MODEL_DSA_MASTER = "anthropic/claude-haiku-latest";

/** App-Identifikation für OpenRouter-Ranking-Header (optional aber empfohlen). */
const OPENROUTER_APP_URL = "https://whisperquest.app";
const OPENROUTER_APP_TITLE = "WhisperQuest";

export function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_APP_URL,
    "X-Title": OPENROUTER_APP_TITLE,
  };
}