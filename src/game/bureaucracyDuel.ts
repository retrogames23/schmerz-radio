/**
 * Bürokratie-Duell — Mehrstufiges Lernsystem (Akt I, Kantine 3602).
 *
 * Adaption des Monkey-Island-Schwertkampfs: Layard lernt aus jedem
 * Trainingsduell gegen Brust einen neuen Verwaltungs-Paragraphen. Mit
 * genug gelernten §§ kann er Brust dreimal in Folge schlagen — und wird
 * damit würdig, den amtierenden Bürokratiemeister Oberinspektor Vossbeck
 * zum Endduell um die Vollmacht 4317 herauszufordern.
 *
 * Mechanik (analog Monkey Island):
 *  - Jede Runde stellt der Gegner eine Behauptung mit Paragraph X.
 *  - Layard wählt aus 4 Antwortoptionen.
 *  - Genau eine Antwort ist die korrekte Kontrierung (Paragraph Y, der
 *    X widerspricht). Diese Antwort kann Layard NUR wählen, wenn er
 *    Paragraph Y bereits gelernt hat — sonst ist sie ausgegraut.
 *  - Im Trainingsduell lernt Layard bei JEDER Brust-Eröffnung den von
 *    Brust zitierten Paragraphen UND dessen offiziellen Konter (sofern
 *    er die Runde übersteht — bei korrekter Antwort sofort, bei falscher
 *    Antwort durch Brusts Schadenfreude-Belehrung).
 *
 * Alle Strings sind ganze Sätze in einem Daten-Modul — i18n-konform,
 * keine String-Konkatenation, keine JSX-Schnipsel.
 */

export type DuelMode = "training" | "endgame";

/**
 * Ein Verwaltungs-Paragraph aus dem fiktiven Kantinen-/Verwaltungsregelwerk.
 * Kann von einem anderen Paragraphen widerlegt werden (`beatenBy`).
 */
export interface Paragraph {
  /** Eindeutige ID, z.B. "p7-1". */
  id: string;
  /** Kurze Bezeichnung für die Notizbuch-Liste, z.B. "Aushang 7.1 (1991)". */
  shortLabel: string;
  /** Volltext, der im Notizbuch erscheint. */
  fullText: string;
  /** IDs derjenigen Paragraphen, die diesen hier außer Kraft setzen. */
  beatenBy: string[];
  /**
   * Optionaler einzeiliger Lernhinweis, der erscheint, wenn der Spieler
   * den Paragraphen frisch ins Notizbuch bekommt.
   */
  learnHint?: string;
}

/**
 * Ein Konter ist eine Antwortoption innerhalb einer Duellrunde. Sie
 * referenziert den Paragraphen, den Layard zitiert. Korrekt ist die
 * Antwort genau dann, wenn `paragraphId` den `attackParagraphId` der
 * Runde widerlegt.
 */
export interface DuelCounter {
  text: string;
  /** Welchen Paragraphen zitiert Layard mit dieser Antwort? */
  paragraphId: string;
  /** Wird aus der Runden-Definition berechnet. */
  correct: boolean;
}

export interface DuelRound {
  id: string;
  /** Wer eröffnet die Runde — Brust (Training) oder Vossbeck (Endgame). */
  opponent: "brust" | "vossbeck";
  /** Paragraph, mit dem der Gegner angreift. */
  attackParagraphId: string;
  /** Wörtliche Eröffnung des Gegners (zitiert den Paragraphen). */
  opening: string;
  /** Vier Antwortoptionen, eine davon korrekt. */
  counters: Array<{ text: string; paragraphId: string }>;
  /** Reaktion des Gegners auf einen Treffer. */
  onHit: string;
  /** Reaktion des Gegners auf einen Fehlschuss (lehrt zugleich den Konter). */
  onMiss: string;
  /** Optionaler Kowalk-Aside (nur Trainingsduelle). */
  kowalkAside?: string;
}

// ──────────────────────────────────────────────────────────────────
// PARAGRAPHEN-KORPUS
// ──────────────────────────────────────────────────────────────────

export const PARAGRAPHS: Record<string, Paragraph> = {
  // Aushänge — Hierarchie nach Datum, mit Übersagungs-Klausel
  "p4-2": {
    id: "p4-2",
    shortLabel: "Aushang 4.2 (1996)",
    fullText:
      "Aushang 4.2 vom 14. März 1996: »Ausgaben der Schicht B erfolgen ausschließlich gegen Schicht-B-Gegenzeichnung. Schicht-A-Vollmachten gelten in Schicht B nicht.«",
    beatenBy: ["p7-1", "p1a"],
    learnHint: "Brusts Lieblingsaushang. Junges Datum, scharfer Ton.",
  },
  "p7-1": {
    id: "p7-1",
    shortLabel: "Aushang 7.1 (1991)",
    fullText:
      "Aushang 7.1 vom 02. August 1991: »Gegenzeichnungen aus benachbarten Schichten gelten als gleichwertig, sofern Identität und Anliegen unstrittig sind.« — Niemals ausdrücklich widerrufen.",
    beatenBy: ["p1a-w"],
    learnHint: "Älter, aber nie widerrufen. Kowalks stilles Schwert.",
  },
  "p1a": {
    id: "p1a",
    shortLabel: "Hausordnung §1a (Übersagung)",
    fullText:
      "Hausordnung §1a: »Bei mehrfacher Überlagerung gilt der jüngere Aushang, sofern der ältere im Wortlaut widerrufen wurde.«",
    beatenBy: ["p1a-w"],
    learnHint:
      "Die Übersagungs-Klausel — und die Hintertür dazu: »sofern widerrufen«.",
  },
  "p1a-w": {
    id: "p1a-w",
    shortLabel: "Hausordnung §1a — Wortlaut-Klausel",
    fullText:
      "Hausordnung §1a, zweiter Halbsatz: »…sofern der ältere im Wortlaut widerrufen wurde.« — Übersagung allein genügt nicht; das Wort »widerrufen« muss im neuen Aushang stehen.",
    beatenBy: [],
    learnHint:
      "Die Hintertür: ohne ausdrücklichen Widerruf bleibt der ältere Aushang in Kraft.",
  },

  // Schicht-Klauseln
  "p3-4": {
    id: "p3-4",
    shortLabel: "Schichtordnung §3 Abs. 4",
    fullText:
      "Schichtordnung §3 Abs. 4: »Schichtwechsel erfolgt nahtlos; in der Übergabezeit dürfen Vorgänge der vorhergehenden Schicht von der nachfolgenden Schicht abgeschlossen werden.«",
    beatenBy: ["p3-4b"],
    learnHint: "Schichtordnung. Übergabe = Fortführung.",
  },
  "p3-4b": {
    id: "p3-4b",
    shortLabel: "Schichtordnung §3 Abs. 4 lit. b",
    fullText:
      "Schichtordnung §3 Abs. 4 lit. b: »Schichtfremde Vorgänge sind fortzuführen, sofern keine ausdrückliche schriftliche Einrede erhoben wird. Eine bloße mündliche Verweigerung gilt nicht als Einrede.«",
    beatenBy: [],
    learnHint:
      "Mündliche Verweigerung zählt nicht. Nur schriftliche Einrede stoppt den Vorgang.",
  },

  // Vollmachten
  "p12": {
    id: "p12",
    shortLabel: "Vollmachtsordnung §12",
    fullText:
      "Vollmachtsordnung §12: »Eine Vollmacht erlischt mit Schichtende des ausstellenden Bediensteten.«",
    beatenBy: ["p12-2"],
    learnHint: "Brusts Trick: Vollmacht 4317 sei mit Schicht A erloschen.",
  },
  "p12-2": {
    id: "p12-2",
    shortLabel: "Vollmachtsordnung §12 Abs. 2",
    fullText:
      "Vollmachtsordnung §12 Abs. 2: »Vollmachten zugunsten von Bewohnern bleiben bis zur tatsächlichen Einlösung wirksam, unabhängig von Schichten oder Personalwechseln. Maßgeblich ist das Ausstellungsdatum, nicht der Einlösezeitpunkt.«",
    beatenBy: [],
    learnHint:
      "Bewohner-Vollmachten überleben den Schichtwechsel. Datum zählt, nicht Uhrzeit.",
  },

  // Identität / Gegenzeichnung
  "p2-1": {
    id: "p2-1",
    shortLabel: "Identitätsordnung §2",
    fullText:
      "Identitätsordnung §2: »Gegenzeichnung nur durch Bedienstete derselben Schicht und desselben Sektors zulässig.«",
    beatenBy: ["p2-3"],
    learnHint: "Strenge Auslegung: Schicht UND Sektor müssen passen.",
  },
  "p2-3": {
    id: "p2-3",
    shortLabel: "Identitätsordnung §2 Abs. 3",
    fullText:
      "Identitätsordnung §2 Abs. 3: »Bei Personalmangel oder unbesetzter Schicht kann die Gegenzeichnung durch eine sektor­benachbarte Stelle erfolgen. Die Annahme darf nicht verweigert werden, sofern die Identität des Bewohners feststeht.«",
    beatenBy: [],
    learnHint:
      "Personalmangel-Klausel: Nachbarstellen dürfen — und müssen — gegenzeichnen.",
  },

  // Endgame-spezifisch: Vossbecks Lieblingstrick
  "p99": {
    id: "p99",
    shortLabel: "Generalvorbehalt §99",
    fullText:
      "Verwaltungsrahmenordnung §99: »Die Verwaltung behält sich in Zweifelsfällen die endgültige Entscheidung vor.«",
    beatenBy: ["p99-z"],
    learnHint:
      "Vossbecks Trumpf — angeblich. Klingt allmächtig, hat aber eine Bedingung.",
  },
  "p99-z": {
    id: "p99-z",
    shortLabel: "§99 — Zweifelsfall-Bedingung",
    fullText:
      "Verwaltungsrahmenordnung §99, Erläuterung: »Ein Zweifelsfall liegt nur vor, wenn die einschlägigen Spezialnormen lückenhaft oder widersprüchlich sind. Bei klarer Spezialregelung ist §99 nicht anwendbar.«",
    beatenBy: [],
    learnHint:
      "§99 greift nur in echten Lücken. Existiert eine Spezialnorm, ist er gesperrt.",
  },
};

/**
 * Fiktive „Kantinen-Paragraphen" — Layards Pendant zu Guybrushs schlechten
 * Beleidigungen. Klingen plausibel, schlagen aber niemals etwas. Liegen ab
 * Spielstart implizit im Antwort-Pool, ohne im Notizbuch zu erscheinen.
 */
export const FICTIONAL_PARAGRAPHS: Record<string, Paragraph> = {
  "f-pause-4": {
    id: "f-pause-4",
    shortLabel: "Pausenordnung §4",
    fullText: "Pausenordnung §4: »Brötchen sind vor der Suppe auszugeben.«",
    beatenBy: [],
  },
  "f-aushang-12-3": {
    id: "f-aushang-12-3",
    shortLabel: "Aushang 12.3 (1988)",
    fullText:
      "Aushang 12.3 vom 09. Mai 1988: »Tabletts sind in Fahrtrichtung der Ausgabezone zu führen.«",
    beatenBy: [],
  },
  "f-id-7": {
    id: "f-id-7",
    shortLabel: "Identitätsordnung §7",
    fullText:
      "Identitätsordnung §7: »Bei Nachschlag ist der Lichtbildausweis erneut vorzuzeigen.«",
    beatenBy: [],
  },
  "f-haus-9c": {
    id: "f-haus-9c",
    shortLabel: "Hausordnung §9c",
    fullText: "Hausordnung §9c: »Pfeifen im Speisesaal ist zu unterlassen.«",
    beatenBy: [],
  },
  "f-aushang-2-2": {
    id: "f-aushang-2-2",
    shortLabel: "Aushang 2.2 (1993)",
    fullText:
      "Aushang 2.2 vom 17. November 1993: »Suppenlöffel sind nach Gebrauch mit der konvexen Seite nach oben abzulegen.«",
    beatenBy: [],
  },
  "f-vor-5": {
    id: "f-vor-5",
    shortLabel: "Vorratsordnung §5",
    fullText:
      "Vorratsordnung §5: »Nachschub aus dem Lager B-Süd erfolgt ausschließlich freitags nach 14 Uhr.«",
    beatenBy: [],
  },
  "f-tres-3": {
    id: "f-tres-3",
    shortLabel: "Tresenordnung §3",
    fullText:
      "Tresenordnung §3: »Bewohner haben einen Mindestabstand von vierzig Zentimetern zur Ausgabekante zu wahren.«",
    beatenBy: [],
  },
  "f-stempel-1b": {
    id: "f-stempel-1b",
    shortLabel: "Stempelordnung §1 lit. b",
    fullText:
      "Stempelordnung §1 lit. b: »Stempel sind mittig auf der Unterschriftenzeile zu setzen, niemals darüber.«",
    beatenBy: [],
  },
};

/** Lookup, der echte UND fiktive Paragraphen findet. */
export function getParagraph(id: string): Paragraph | undefined {
  return PARAGRAPHS[id] ?? FICTIONAL_PARAGRAPHS[id];
}

// ──────────────────────────────────────────────────────────────────
// RUNDEN-POOLS
// ──────────────────────────────────────────────────────────────────

/** Trainingsrunden gegen Brust — fiktive Kantinen-Streitfälle. */
export const TRAINING_ROUNDS: DuelRound[] = [
  {
    id: "training-aushang",
    opponent: "brust",
    attackParagraphId: "p4-2",
    opening:
      "Bewohner Worag. Fiktiver Fall: Bewohner X holt B3 in Schicht B mit Vollmacht aus Schicht A. Aushang vier Punkt zwei vom 14. März 1996 ist eindeutig. Schicht A gilt nicht in Schicht B.",
    counters: [
      { text: "Aushang sieben Punkt eins von 1991 hebt das auf — gleichwertige Gegenzeichnung.", paragraphId: "p7-1" },
      { text: "Hausordnung §1a — Übersagung, also gilt der jüngere.", paragraphId: "p1a" },
      { text: "Vollmachtsordnung §12 — die Vollmacht ist erloschen.", paragraphId: "p12" },
      { text: "Generalvorbehalt §99 — die Verwaltung entscheidet.", paragraphId: "p99" },
    ],
    onHit:
      "Aushang sieben Punkt eins ist tatsächlich nie ausdrücklich widerrufen worden. Das ist … korrekt.",
    onMiss:
      "Bewohner Worag, Sie verkennen die Lage. Aushang sieben Punkt eins von 1991 wäre die korrekte Gegennorm. Notieren Sie sich das.",
    kowalkAside: "Aushang sieben Punkt eins. Schreib es dir auf, Worag.",
  },
  {
    id: "training-uebersagt",
    opponent: "brust",
    attackParagraphId: "p1a",
    opening:
      "Nächster fiktiver Fall. Hausordnung §1a: Bei Überlagerung gilt der jüngere Aushang. Punkt. Damit wäre vier Punkt zwei der einzig gültige.",
    counters: [
      { text: "Aushang sieben Punkt eins von 1991 — älter, aber gültig.", paragraphId: "p7-1" },
      { text: "§1a, zweiter Halbsatz: nur, wenn der ältere im Wortlaut widerrufen wurde.", paragraphId: "p1a-w" },
      { text: "Schichtordnung §3 Abs. 4 — Übergabezeit.", paragraphId: "p3-4" },
      { text: "Identitätsordnung §2 — Gegenzeichnung.", paragraphId: "p2-1" },
    ],
    onHit:
      "»…sofern der ältere im Wortlaut widerrufen wurde.« Korrekt zitiert. Das Wort »widerrufen« kommt im neuen Aushang nicht vor.",
    onMiss:
      "Falsch. Die korrekte Erwiderung wäre der zweite Halbsatz von §1a gewesen — die Wortlaut-Klausel. Übersagung ohne Widerruf trägt nicht.",
    kowalkAside: "Übersagt ist nicht widerrufen. Das hat sie schön gesagt.",
  },
  {
    id: "training-schicht",
    opponent: "brust",
    attackParagraphId: "p3-4",
    opening:
      "Fiktiver Fall: Bewohnerin Y reicht in Schicht B einen Vorgang ein, den Schicht A angefangen hat. Schichtordnung §3 Abs. 4 — nahtlose Übergabe — gilt nur für die Bediensteten, nicht für Bewohnervorgänge.",
    counters: [
      { text: "§3 Abs. 4 lit. b — mündliche Verweigerung gilt nicht als Einrede.", paragraphId: "p3-4b" },
      { text: "Aushang sieben Punkt eins von 1991.", paragraphId: "p7-1" },
      { text: "Vollmachtsordnung §12 Abs. 2 — Bewohner-Vollmacht.", paragraphId: "p12-2" },
      { text: "Identitätsordnung §2 — Gegenzeichnung.", paragraphId: "p2-1" },
    ],
    onHit:
      "§3 Abs. 4 lit. b. Sie haben Recht — eine bloße mündliche Verweigerung genügt nicht. Es bräuchte eine schriftliche Einrede.",
    onMiss:
      "Sie hätten §3 Abs. 4 lit. b zitieren müssen. Mündliche Verweigerung ist keine Einrede. Das steht ausdrücklich im Buchstaben b.",
    kowalkAside: "Brust verweigert immer mündlich. Immer.",
  },
  {
    id: "training-vollmacht",
    opponent: "brust",
    attackParagraphId: "p12",
    opening:
      "Fiktiver Fall: Vollmacht ausgestellt um 11:55, eingelöst um 12:05. Schichtwechsel zwölf Uhr. Vollmachtsordnung §12: erloschen.",
    counters: [
      { text: "§12 Abs. 2 — Bewohner-Vollmachten überleben Schichtwechsel.", paragraphId: "p12-2" },
      { text: "Aushang sieben Punkt eins.", paragraphId: "p7-1" },
      { text: "§3 Abs. 4 — nahtlose Übergabe.", paragraphId: "p3-4" },
      { text: "Generalvorbehalt §99.", paragraphId: "p99" },
    ],
    onHit:
      "§12 Abs. 2. — »Maßgeblich ist das Ausstellungsdatum, nicht der Einlösezeitpunkt.« Das ist … unbestreitbar.",
    onMiss:
      "Falsch. §12 Abs. 2 hätte gegolten — Bewohner-Vollmachten erlöschen nicht mit Schichtende. Das ist eine Spezialregel.",
    kowalkAside: "Absatz Zwei. Den vergisst er gern.",
  },
  {
    id: "training-identitaet",
    opponent: "brust",
    attackParagraphId: "p2-1",
    opening:
      "Fiktiver Fall: Gegenzeichnung aus Sektor E68 für einen E67-Bewohner. Identitätsordnung §2: nur dieselbe Schicht UND derselbe Sektor.",
    counters: [
      { text: "§2 Abs. 3 — Personalmangel-Klausel, sektorbenachbarte Stelle.", paragraphId: "p2-3" },
      { text: "Aushang sieben Punkt eins von 1991.", paragraphId: "p7-1" },
      { text: "Vollmachtsordnung §12 Abs. 2.", paragraphId: "p12-2" },
      { text: "Schichtordnung §3 Abs. 4 lit. b.", paragraphId: "p3-4b" },
    ],
    onHit:
      "§2 Abs. 3. Bei Personalmangel ist die Annahme nicht verweigerbar. Sie zitieren es richtig.",
    onMiss:
      "Falsch. §2 Abs. 3 — die Personalmangel-Klausel — wäre Ihre Erwiderung gewesen. Der Sektor E67 ist heute halb besetzt.",
    kowalkAside: "Personalmangel haben wir hier seit Jahren.",
  },
];

/** Endgame-Runden gegen Vossbeck — der echte Fall: Vollmacht 4317. */
export const ENDGAME_ROUNDS: DuelRound[] = [
  {
    id: "endgame-1",
    opponent: "vossbeck",
    attackParagraphId: "p4-2",
    opening:
      "Worag. Vollmacht 4317. Marteau. Schicht A. Heute Schicht B. Aushang vier Punkt zwei untersagt. Ich bestätige Brusts Entscheidung.",
    counters: [
      { text: "Aushang sieben Punkt eins von 1991 — gleichwertige Gegenzeichnung, nie widerrufen.", paragraphId: "p7-1" },
      { text: "Hausordnung §1a.", paragraphId: "p1a" },
      { text: "Vollmachtsordnung §12.", paragraphId: "p12" },
      { text: "Identitätsordnung §2.", paragraphId: "p2-1" },
    ],
    onHit:
      "Hm. Aushang 7.1. Tatsächlich nicht widerrufen. — Das nehme ich auf. Weiter.",
    onMiss:
      "Worag. Sie hätten lernen können. Aushang 7.1 wäre Ihre Karte gewesen. Wir machen das nicht noch einmal.",
  },
  {
    id: "endgame-2",
    opponent: "vossbeck",
    attackParagraphId: "p12",
    opening:
      "Marteau hat in Schicht A unterzeichnet. Schicht A endete um zwölf Uhr. Vollmachtsordnung §12: erloschen. Daran ändert auch ein alter Aushang nichts.",
    counters: [
      { text: "Vollmachtsordnung §12 Abs. 2 — maßgeblich ist das Ausstellungsdatum.", paragraphId: "p12-2" },
      { text: "Aushang sieben Punkt eins.", paragraphId: "p7-1" },
      { text: "§1a Wortlaut-Klausel.", paragraphId: "p1a-w" },
      { text: "Schichtordnung §3 Abs. 4.", paragraphId: "p3-4" },
    ],
    onHit:
      "§12 Abs. 2. — Lex specialis. Sie haben mich an meiner eigenen Wand erwischt, Worag.",
    onMiss:
      "Falsch. §12 Abs. 2 hätte gegolten. Sie hatten ihn in Ihrem Notizbuch. Sie haben ihn nicht gespielt.",
  },
  {
    id: "endgame-3",
    opponent: "vossbeck",
    attackParagraphId: "p99",
    opening:
      "Genug der Spezialnormen. Verwaltungsrahmenordnung §99: Generalvorbehalt. In Zweifelsfällen entscheidet die Verwaltung. Heißt: ich. Ration verweigert.",
    counters: [
      { text: "§99 Erläuterung — kein Zweifelsfall, wenn Spezialnorm vorliegt.", paragraphId: "p99-z" },
      { text: "Aushang sieben Punkt eins.", paragraphId: "p7-1" },
      { text: "§1a Wortlaut-Klausel.", paragraphId: "p1a-w" },
      { text: "Vollmachtsordnung §12 Abs. 2.", paragraphId: "p12-2" },
    ],
    onHit:
      "(Lange Pause.) Sie zitieren die Erläuterung zu §99. Korrekt. Ein Zweifelsfall liegt nicht vor — wir haben Spezialnormen. Sie haben § 7.1, § 1a Wortlaut, § 12 Abs. 2 ins Feld geführt. Das genügt.",
    onMiss:
      "Sie verwechseln Generalvorbehalt mit Generalermächtigung, Worag. Die Erläuterung zu §99 wäre Ihr letzter Stein gewesen. Schade.",
  },
];

// ──────────────────────────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────────────────────────

/**
 * Liefert die korrekte Konter-Paragraph-ID für eine Runde, oder `null`,
 * wenn keine der angebotenen Antworten den Angriffs-Paragraphen schlägt.
 */
export function correctCounterId(round: DuelRound): string | null {
  const attack = PARAGRAPHS[round.attackParagraphId];
  if (!attack) return null;
  for (const c of round.counters) {
    if (attack.beatenBy.includes(c.paragraphId)) return c.paragraphId;
  }
  return null;
}

/** Resolved counter mit korrekt-Markierung — für die Overlay-Anzeige. */
export function resolveCounters(round: DuelRound): DuelCounter[] {
  const correctId = correctCounterId(round);
  return round.counters.map((c) => ({
    text: c.text,
    paragraphId: c.paragraphId,
    correct: c.paragraphId === correctId,
  }));
}

/**
 * Baut die vier Antwort-Optionen für eine Runde abhängig vom aktuellen
 * Wissensstand des Spielers (Monkey-Island-Logik):
 *
 *  - Wenn der Spieler mindestens einen korrekten Konter (= einen Paragraph,
 *    der `attackParagraphId` schlägt) bereits gelernt hat, kommt GENAU EINER
 *    davon in die Auswahl. Die übrigen Plätze werden mit unpassenden echten
 *    Paragraphen + fiktiven Kantinen-Paragraphen aufgefüllt.
 *  - Wenn nicht, sind alle vier Antworten falsch (Mix aus unpassenden echten
 *    + fiktiven). Die Runde ist dann nicht gewinnbar — der Spieler weiß das
 *    nicht und muss raten. Bei Fehlschlag lernt er den korrekten Konter.
 *
 * Die Original-Counter-Liste der Runde wird als Pool für die "echten,
 * unpassenden" Optionen genutzt (sie sind passgenau formuliert).
 */
export function buildRoundCounters(
  round: DuelRound,
  knownIds: ReadonlySet<string>,
): DuelCounter[] {
  const TARGET = 4;
  const attack = PARAGRAPHS[round.attackParagraphId];
  const correctIds = attack ? attack.beatenBy : [];

  // 1) Korrekten Konter aus den Runden-Optionen wählen — falls bekannt.
  const correctOption = round.counters.find(
    (c) => correctIds.includes(c.paragraphId) && knownIds.has(c.paragraphId),
  );

  const picked: Array<{ text: string; paragraphId: string; correct: boolean }> =
    [];
  const usedIds = new Set<string>();

  if (correctOption) {
    picked.push({ ...correctOption, correct: true });
    usedIds.add(correctOption.paragraphId);
  }

  // 2) Auffüllen mit unpassenden echten Optionen aus dem Runden-Pool.
  const wrongRealPool = shuffle(
    round.counters.filter(
      (c) => !correctIds.includes(c.paragraphId) && !usedIds.has(c.paragraphId),
    ),
  );
  for (const c of wrongRealPool) {
    if (picked.length >= TARGET) break;
    picked.push({ ...c, correct: false });
    usedIds.add(c.paragraphId);
  }

  // 3) Auffüllen mit fiktiven Kantinen-Paragraphen.
  const fictionalPool = shuffle(Object.values(FICTIONAL_PARAGRAPHS));
  for (const f of fictionalPool) {
    if (picked.length >= TARGET) break;
    if (usedIds.has(f.id)) continue;
    picked.push({
      text: f.fullText.replace(/^[^:]+:\s*»?/, "").replace(/«\.?$/, ""),
      paragraphId: f.id,
      correct: false,
    });
    usedIds.add(f.id);
  }

  return shuffle(picked);
}

/**
 * Picks `n` random training rounds (no repeats per session). Counters
 * within each round are shuffled. Order of rounds is randomised.
 */
export function pickTrainingRounds(n: number = 3): DuelRound[] {
  return pickRounds(TRAINING_ROUNDS, n);
}

/** Endgame is fixed: 3 rounds in order. */
export function pickEndgameRounds(): DuelRound[] {
  return ENDGAME_ROUNDS.map((r) => ({ ...r, counters: shuffle(r.counters) }));
}

function pickRounds(pool: readonly DuelRound[], n: number): DuelRound[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length)).map((r) => ({
    ...r,
    counters: shuffle(r.counters),
  }));
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────
// UI-TEXTE
// ──────────────────────────────────────────────────────────────────

export const DUEL_UI_TEXT = {
  trainingTitle: "Bürokratie-Duell · Trainingsfall · Tresen Schicht B",
  endgameTitle: "Bürokratie-Duell · Vollmacht 4317 · Endrunde",
  trainingSubtitle:
    "Zwei Treffer mehr als Fehler — und Sie gewinnen den Trainingsfall. Drei Fehler — und Brust schließt für heute.",
  endgameSubtitle:
    "Drei Treffer in Folge — und Vossbeck gibt die Vollmacht frei. Drei Fehler — und der Fall ist verloren.",
  hitsLabel: "Treffer",
  missesLabel: "Fehler",
  roundLabel: "Runde",
  prompt: "Ihre Erwiderung:",
  learnedBadge: "📓 gelernt",
  unlearnedBadge: "🔒 nicht gelernt",
  unlearnedHint:
    "Diese Antwort referenziert einen Paragraphen, den Sie noch nicht im Notizbuch haben. Lernen Sie ihn in einem anderen Trainingsduell.",
  brustMood: {
    composed: "Brust steht sehr gerade. Hände auf dem Tresen.",
    sweating: "Brust hat begonnen zu schwitzen. Sein linker Mundwinkel zuckt.",
    crumbling: "Brust schaut nicht mehr auf. Er wischt mit dem Handrücken über die Stirn.",
    triumphant: "Brust hat sich aufgerichtet. Er hat heute schon einmal gewonnen — er weiß, wie das geht.",
  },
  vossbeckMood: {
    composed: "Vossbeck schlägt eine Akte auf. Sein Blick wandert nicht.",
    sweating: "Vossbeck blättert vor und zurück. Etwas stimmt nicht in seiner Reihenfolge.",
    crumbling: "Vossbeck legt den Bleistift ab. Er hatte ihn die ganze Zeit in der Hand.",
    triumphant: "Vossbeck lehnt sich zurück. Er hat Sie vermessen.",
  },
  trainingVictoryHeadline: "Trainingsfall gewonnen.",
  trainingVictoryLines: [
    "Brust nickt knapp. Schreibt etwas in sein Heft.",
    "„Bewohner Worag. Argumentation tragfähig. Trainingsfall abgeschlossen.“",
    "Im Hintergrund Kowalk, halblaut: „Du wirst besser, Worag.“",
  ],
  trainingDefeatHeadline: "Brust schließt die Ausgabezone.",
  trainingDefeatLines: [
    "Brust hebt langsam den Kopf. Seine Mimik wird wieder steif.",
    "„Bewohner Worag. Ihre Argumentation trägt nicht. Trainingsfall verloren.“",
    "„Bitte verlassen Sie die Ausgabezone. Sie können es zu einem späteren Zeitpunkt erneut versuchen.“",
  ],
  endgameVictoryHeadline: "Vossbeck kapituliert. Vollmacht 4317 anerkannt.",
  endgameVictoryLines: [
    "Vossbeck legt die Vollmacht sehr sorgfältig auf den Tresen. Glättet sie.",
    "„Bewohner Worag. Ihre Argumentation ist … in sich schlüssig. Die Ration wird ausgegeben.“",
    "Brust bückt sich, holt eine grau-amber lackierte Dose hervor und schiebt sie über den Tresen.",
    "Im Hintergrund Kowalk, halblaut: „So habe ich Vossbeck noch nie gesehen, Worag. Glückwunsch.“",
    "[ B3-Ration eingesteckt. ]",
  ],
  endgameDefeatHeadline: "Vossbeck schließt den Vorgang.",
  endgameDefeatLines: [
    "Vossbeck schlägt die Akte zu. Schaut nicht mehr auf.",
    "„Bewohner Worag. Vorgang Vollmacht 4317 — abschlägig beschieden.“",
    "„Sie können sich erneut anmelden, sobald Sie weitere Erwiderungen … gelernt haben.“",
    "Brust steht hinter Vossbeck. Sehr gerade.",
  ],
  victoryAccept: "[ Weiter ]",
  defeatAccept: "[ Tresen verlassen ]",
  abortLabel: "[ Zurücktreten ]",
  abortLines: [
    "Layard tritt einen halben Schritt vom Tresen zurück.",
    "Brust nickt knapp. „Wenn Sie wieder bereit sind, Bewohner Worag.“",
  ],
  paragraphLearnedToast: (p: Paragraph) =>
    `📓 Neuer Paragraph gelernt: ${p.shortLabel}. ${p.learnHint ?? ""}`,
};