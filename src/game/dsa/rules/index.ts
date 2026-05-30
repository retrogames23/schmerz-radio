import { DSA3_RULES_BLOCK } from "./mechanics";
import { weaponsForPrompt } from "./weapons";
import { talentsForPrompt } from "./talents";
import { spellsForPrompt } from "./spells";

export * from "./mechanics";
export * from "./weapons";
export * from "./talents";
export * from "./spells";

/**
 * Kompakter Regel-Block für den System-Prompt des LLM-Meisters.
 * Enthält nur Mechanik (Proben, Modifikatoren, Standard-Werte) — keine
 * Auszüge aus dem Originalregelwerk.
 */
export function buildDsa3RulesBlock(): string {
  return [
    "DSA3-REGELREFERENZ (Mechanik, eigene Zusammenfassung):",
    "",
    DSA3_RULES_BLOCK,
    "",
    talentsForPrompt(),
    "",
    spellsForPrompt(),
    "",
    weaponsForPrompt(),
    "",
    "NUTZUNG IM SPIEL:",
    "  - Fordere [CHECK: <ATTR> [+/-N]] mit passendem Modifikator aus der Tabelle oben.",
    "  - Wähle bei Talenten/Zaubern aus den obigen Listen statt frei zu erfinden.",
    "  - Bei NSC-Bewaffnung: greife auf die WAFFEN-Tabelle zurück (TP, AT/PA, Reichweite).",
    "  - Erfinde keine neuen Zauber/Talente während des Spiels — nutze die Liste oder beschreibe rein erzählerisch.",
  ].join("\n");
}