import { DSA3_RULES_BLOCK } from "./mechanics";
import { weaponsForPrompt } from "./weapons";
import { talentsForPrompt } from "./talents";
import { spellsForPrompt } from "./spells";
import { armorsForPrompt } from "./armor";

export * from "./mechanics";
export * from "./weapons";
export * from "./talents";
export * from "./spells";
export * from "./armor";

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
    "NUTZUNG IM SPIEL:",
    "  - Fordere [CHECK: <ATTR> [+/-N]] mit passendem Modifikator aus der Tabelle oben.",
    "  - Talente/Zauber/Waffen/Rüstungen sind nicht im Prompt — bei Bedarf via",
    "    dsaLore({topic:'liste.talente'|'liste.zauber'|'liste.waffen'|'liste.ruestungen'})",
    "    nachschlagen, dann das konkrete Detail via talent.<id> / zauber.<id> / waffe.<id> / ruestung.<id>.",
    "  - Erfinde keine neuen Zauber/Talente — nutze Lookup oder beschreibe rein erzählerisch.",
  ].join("\n");
}