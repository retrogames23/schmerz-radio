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