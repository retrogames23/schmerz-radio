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
 * Optimiert für OpenAI (Markdown-Listen für strikte Befolgung).
 */
export function buildDsa3RulesBlock(): string {
  return [
    "### DSA3-REGELREFERENZ (MECHANIK)",
    DSA3_RULES_BLOCK,
    "",
    "### NUTZUNG IM SPIEL (STRIKTE REGELN)",
    "- **Proben:** Fordere ausschließlich `[CHECK: <ATTR> [+/-N]]` mit passendem Modifikator aus der Tabelle.",
    "- **Lookup-Zwang:** Talente, Zauber, Waffen und Rüstungen sind NICHT geladen. Nutze bei Bedarf zwingend `dsaLore({topic:'liste.talente'|'liste.zauber'|'liste.waffen'|'liste.ruestungen'})`.",
    "- **Details abrufen:** Nach der Liste das konkrete Detail via `talent.<id>`, `zauber.<id>`, `waffe.<id>` oder `ruestung.<id>` laden.",
    "- **VERBOT:** Erfinde NIEMALS eigene Zauber oder Talente. Nutze Lookup oder beschreibe die Aktion rein erzählerisch.",
  ].join("\n");
}