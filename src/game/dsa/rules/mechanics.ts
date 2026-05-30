/**
 * DSA3 Regelmechanik — Kurzreferenz für den LLM-Meister.
 *
 * Enthält ausschließlich Spielmechanik (Probenlogik, Schwellen, Modifikatoren)
 * in eigenen Worten formuliert. KEINE Auszüge aus dem Original-Regelwerk.
 */

export const ATTRIBUTES = [
  "MU", // Mut
  "KL", // Klugheit
  "IN", // Intuition
  "CH", // Charisma
  "FF", // Fingerfertigkeit
  "GE", // Gewandtheit
  "KK", // Körperkraft
] as const;

export type AttributeId = (typeof ATTRIBUTES)[number];

export const ATTRIBUTE_NAMES: Record<AttributeId, string> = {
  MU: "Mut",
  KL: "Klugheit",
  IN: "Intuition",
  CH: "Charisma",
  FF: "Fingerfertigkeit",
  GE: "Gewandtheit",
  KK: "Körperkraft",
};

/** Probenmechanik in eigenen Worten — wird in den System-Prompt eingebettet. */
export const PROBE_RULES = `
EIGENSCHAFTSPROBE (1 W20):
  Wurf <= (Eigenschaft + Bonus - Erschwernis) ⇒ Erfolg.
  Bei Erschwernis +N muss der Wurf entsprechend kleiner ausfallen.

TALENT-/ZAUBERPROBE (3 W20):
  Drei W20 gegen drei Eigenschaften (in fester Reihenfolge des Talents/Zaubers).
  Jeder Wurf, der die jeweilige Eigenschaft überschreitet, frisst die Differenz
  vom Talent-/Zauberwert (TaW/ZfW). Bleibt der Wert >= 0, ist die Probe geschafft.
  Bei Modifikator +N werden die Eigenschaftswerte für diese Probe um N gesenkt
  (bei -N erhöht).

KRITISCHE WÜRFE:
  Zwei oder drei 1en in einer 3W20-Probe ⇒ besonders gelungen.
  Zwei oder drei 20en ⇒ Patzer (Mishap), oft mit Folge.
`.trim();

/** Kampf-Grundregeln. */
export const COMBAT_RULES = `
KAMPFRUNDE (DSA3):
  Initiative = INI-Basiswert (klassenabhängig) + 1W6.
  Pro Kampfrunde 1 Aktion (Attacke oder Parade als Reaktion) für die meisten Helden.

ATTACKE / PARADE:
  Attacke gelingt mit 1W20 <= AT-Wert (modifiziert).
  Verteidiger pariert mit 1W20 <= PA-Wert. Gelingt die Parade, kein Schaden.
  Bei misslungener Parade: TP der Waffe + KK-Bonus - Rüstungsschutz (RS) = LE-Verlust.

TRAGEN VON SCHADEN:
  LE 0 ⇒ kampfunfähig (in dieser App: kein Tod, sondern Fail-Forward-Szene).
  AuP 0 ⇒ erschöpft, alle Proben um 1 erschwert.

WUNDSCHWELLE (Hausregel-tauglich):
  Schaden > KO ⇒ -1 auf alle Aktionen für 1 Kampfrunde.
`.trim();

/** Magie-Grundregeln. */
export const MAGIC_RULES = `
ZAUBERWIRKEN:
  Kosten in AsP (siehe Zauberliste).
  3W20 gegen die drei Eigenschaften des Zaubers (Probenmechanik wie Talent).
  Bei Hauszauber (Stammrepertoire der Klasse) wird die Probe um 3 erleichtert.
  Fremdzauber: +3 erschwert oder gar nicht möglich, je nach Klasse.

REGENERATION:
  AsP/AuP regenerieren mit Schlaf (typ. 1W6 pro Nacht).
  LE regeneriert langsamer und kann durch Heilkunde-Wunden / Heilzauber beschleunigt werden.
`.trim();

/** Erleichterungs-/Erschwernis-Konventionen für den Meister. */
export const MODIFIER_GUIDE = `
TYPISCHE MODIFIKATOREN (Meister-Richtwerte):
  -3 sehr leicht        (Routine unter idealen Bedingungen)
   0 normal              (Standardbedingungen)
  +3 fordernd            (Zeitdruck, schlechte Sicht, leichte Ablenkung)
  +7 schwer              (akute Gefahr, fremde Sprache, Dunkelheit)
  +12 extrem             (Sturm, Verletzung, gegnerischer Widerstand)
  +15+ kaum machbar      (nur mit Spezialisierung sinnvoll)
`.trim();

/** Aggregierter Block für den System-Prompt. */
export const DSA3_RULES_BLOCK = `
${PROBE_RULES}

${COMBAT_RULES}

${MAGIC_RULES}

${MODIFIER_GUIDE}
`.trim();