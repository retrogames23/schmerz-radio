/**
 * Bürokratie-Duell — „Phrasen-Dreschen" (Akt I, Kantine 3602).
 *
 * Reines Daten-Modul: enthält den Korpus aller Phrasen und Konter, die
 * an Brusts Tresen und in Vossbecks Endrunde verwendet werden. Die
 * Mechanik des Duells (Runden, Tally, Lernen) lebt in den Dialog-Bäumen
 * `cafeteriaTrainingA/B/C` und `vossbeckDuel` — KEIN eigenes Overlay.
 *
 * Mechanik (umgesetzt in Dialog-Bäumen):
 *  - Brust greift mit einer Phrase an → Spieler wählt aus 4 Kontern.
 *    Treffer = Punkt für Layard. Fehler = Brust liefert den richtigen
 *    Konter NACH, und der Spieler kann ihn ins Phrasenbuch aufnehmen
 *    (EINZIGE Lernquelle im Duell — durch falsches Raten lernt Layard
 *    NICHTS).
 *  - In Layards Angriffsrunde wirft er selbst eine Phrase. Kennt der
 *    Gegner sie nicht → Gegner stottert sichtbar (Treffer). Sonst
 *    kontert er souverän (Fehler).
 *
 * Alle Strings sind ganze Sätze, i18n-konform.
 */

/** Eine Behörden-Phrase, mit der ein Gegner angreift. */
export interface Phrase {
  id: string;
  shortLabel: string;
  text: string;
}

/** Ein Konter — Layards schlagfertige Antwort. Landet im Phrasenbuch. */
export interface Counter {
  id: string;
  shortLabel: string;
  text: string;
  /** Phrasen-IDs, die dieser Konter humorvoll erledigt. */
  beats: string[];
  /** Optionaler Lernhinweis fürs Phrasenbuch. */
  learnHint?: string;
}

// ──────────────────────────────────────────────────────────────────
// PHRASEN-KORPUS (Brust- + Vossbeck-Angriffe)
// ──────────────────────────────────────────────────────────────────

export const PHRASES: Record<string, Phrase> = {
  // Trainingsphrasen — Brust feuert sie an seinem Tresen.
  "p-immer-so": {
    id: "p-immer-so",
    shortLabel: "Tradition",
    text: "Das haben wir hier schon immer so gemacht.",
  },
  "p-stapel": {
    id: "p-stapel",
    shortLabel: "Stapel-Bluff",
    text: "Ihr Vorgang liegt ganz unten auf meinem Stapel.",
  },
  "p-nicht-zustaendig": {
    id: "p-nicht-zustaendig",
    shortLabel: "Nicht-Zuständigkeit",
    text: "Dafür bin ich nicht zuständig.",
  },
  "p-termin": {
    id: "p-termin",
    shortLabel: "Terminzwang",
    text: "Dafür bräuchten Sie einen Termin.",
  },
  "p-formsache": {
    id: "p-formsache",
    shortLabel: "Reine Formsache",
    text: "Das ist eine reine Formsache. Es geht um den Vorgang als solchen.",
  },
  "p-vorgesetzte": {
    id: "p-vorgesetzte",
    shortLabel: "Vorgesetzten-Drohung",
    text: "Das müsste ich erst meinem Vorgesetzten vorlegen.",
  },

  // Endgame-Phrasen (Vossbeck) — kühler, distanzierter, derselbe Bautyp.
  "pE-tradition": {
    id: "pE-tradition",
    shortLabel: "Vossbeck: Verfahren",
    text: "Bewohner Worag. Wir halten uns hier an Verfahren, die sich seit Jahrzehnten bewährt haben.",
  },
  "pE-stapel-hoheit": {
    id: "pE-stapel-hoheit",
    shortLabel: "Vossbeck: Vertagung",
    text: "Über Vollmacht 4317 wird heute nicht entschieden. Setzen Sie sich auf meinen Stapel.",
  },
  "pE-vorgesetzten-bluff": {
    id: "pE-vorgesetzten-bluff",
    shortLabel: "Vossbeck: Vorgesetzter",
    text: "Einen Vorgang dieser Tragweite werde ich der Bewohnervertretungs-Aufsicht vorlegen müssen.",
  },
};

// ──────────────────────────────────────────────────────────────────
// KONTER-KORPUS (Layards Antworten — landen im Phrasenbuch)
// ──────────────────────────────────────────────────────────────────

export const COUNTERS: Record<string, Counter> = {
  "c-immer-so": {
    id: "c-immer-so",
    shortLabel: "„Sieht man dem Sektor an“",
    text: "Das sieht man dem Sektor auch an.",
    beats: ["p-immer-so", "pE-tradition"],
    learnHint:
      "Gegen jede Form von Tradition-als-Argument. Funktioniert, weil es niemand widerlegen kann.",
  },
  "c-stapel": {
    id: "c-stapel",
    shortLabel: "„Last des ganzen Hauses“",
    text: "Perfekt — dann trägt er wenigstens die Last des ganzen Hauses.",
    beats: ["p-stapel", "pE-stapel-hoheit"],
    learnHint:
      "Macht aus dem Stapel-Bluff einen Verdienst. Die Phrase wird zum Lob — der Gegner muss nicken.",
  },
  "c-nicht-zustaendig": {
    id: "c-nicht-zustaendig",
    shortLabel: "„Türschild sagt anderes“",
    text: "Erstaunlich. Auf Ihrem Türschild steht das Gegenteil.",
    beats: ["p-nicht-zustaendig"],
    learnHint:
      "Der Klassiker gegen Nicht-Zuständigkeit. Das Türschild gewinnt fast immer.",
  },
  "c-termin": {
    id: "c-termin",
    shortLabel: "„Den hätte ich gern“",
    text: "Den hätte ich gern — bei jemandem, der zuständig ist.",
    beats: ["p-termin"],
    learnHint:
      "Verwandelt den Terminzwang in eine Bringschuld der Gegenseite.",
  },
  "c-formsache": {
    id: "c-formsache",
    shortLabel: "„Dann füllen Sie sie aus“",
    text: "Wunderbar. Dann füllen Sie sie doch eben aus.",
    beats: ["p-formsache"],
    learnHint:
      "Wer „Formsache“ sagt, kann sie auch selbst erledigen. Punkt.",
  },
  "c-vorgesetzte": {
    id: "c-vorgesetzte",
    shortLabel: "„Holen Sie ihn. Ich warte“",
    text: "Wunderbar. Holen Sie ihn. Ich warte.",
    beats: ["p-vorgesetzte", "pE-vorgesetzten-bluff"],
    learnHint:
      "Gegen jeden Vorgesetzten-Bluff. Niemand will den Vorgesetzten wirklich holen.",
  },
};

/** Lookup für Konter. */
export function getCounter(id: string): Counter | undefined {
  return COUNTERS[id];
}

/** Lookup für Phrasen. */
export function getPhrase(id: string): Phrase | undefined {
  return PHRASES[id];
}

// Legacy alias — alter Code/Notebook greift über diesen Namen zu.
export const PARAGRAPHS = COUNTERS;
export type Paragraph = Counter;
export function getParagraph(id: string): Counter | undefined {
  return getCounter(id);
}

// ──────────────────────────────────────────────────────────────────
// ANGRIFFS-PHRASEN (Layard wirft sie — Runde-2-Auswahl)
// ──────────────────────────────────────────────────────────────────

/**
 * Eine Bürokratie-Phrase, die LAYARD selbst gegen den Gegner einsetzt.
 * Lernt er von anderen Bewohnern (Bodo, Helka — die haben Brust selbst
 * schon im Phrasen-Duell besiegt). Eine „echte" Angriffsphrase trifft
 * dann, wenn der Gegner sie nicht zu kontern weiß.
 */
export interface AttackPhrase {
  id: string;
  shortLabel: string;
  text: string;
  source: "bodo" | "helka" | "layard";
  learnHint?: string;
}

/** Echte Angriffsphrasen — Bodo und Helkas Spezialitäten. */
export const ATTACK_PHRASES: Record<string, AttackPhrase> = {
  "a-vorgesetzten-bodo": {
    id: "a-vorgesetzten-bodo",
    shortLabel: "„Holen Sie Ihren Vorgesetzten“",
    text: "Holen Sie doch bitte gleich Ihren Vorgesetzten. Ich warte hier — ich habe Zeit.",
    source: "bodo",
    learnHint:
      "Bodo hat Brust damit zum Schwitzen gebracht. Niemand will seinen Vorgesetzten wirklich holen.",
  },
  "a-tuerschild-helka": {
    id: "a-tuerschild-helka",
    shortLabel: "„Ihr Türschild sagt anderes“",
    text: "Erstaunlich. Ihr eigenes Türschild sagt das genaue Gegenteil von dem, was Sie gerade behaupten.",
    source: "helka",
    learnHint:
      "Helkas Klassiker. Schlägt jeden, der nie auf sein eigenes Türschild geguckt hat.",
  },
};

/**
 * Layards eigene linkische Angriffsversuche — bürokratisch im Ton, aber
 * ohne Substanz. Liegen ab Spielstart implizit im Pool und werden vom
 * Gegner IMMER souverän gekontert (kein Treffer).
 *
 * Alle Optionen bleiben innerhalb des Behörden-Registers — keine
 * Resonanz-Anspielungen, kein Wetter-Smalltalk. Der Spieler soll spüren,
 * dass er sich „bürokratisch durchboxen" will, aber zu schwach ansetzt.
 */
export const FICTIONAL_ATTACKS: Record<string, AttackPhrase> = {
  "fa-bitte": {
    id: "fa-bitte",
    shortLabel: "Höflichkeit",
    text: "Bitte. Es wäre wirklich wichtig für mich.",
    source: "layard",
  },
  "fa-hausflur": {
    id: "fa-hausflur",
    shortLabel: "Hausflurreinigung",
    text: "Stehen Sie nicht eigentlich auf der Liste für die Hausflurreinigung?",
    source: "layard",
  },
  "fa-anlage3": {
    id: "fa-anlage3",
    shortLabel: "Anlage 3",
    text: "Das fällt unter Anlage 3 — bitte besorgen Sie den korrekten Stempel.",
    source: "layard",
  },
  "fa-sechs-wochen": {
    id: "fa-sechs-wochen",
    shortLabel: "Sechs-Wochen-Frist",
    text: "Diesen Antrag hätten Sie eigentlich vor sechs Wochen stellen müssen.",
    source: "layard",
  },
  "fa-protokoll": {
    id: "fa-protokoll",
    shortLabel: "„Steht im Protokoll“",
    text: "Das steht so im Sitzungsprotokoll vom letzten Quartal.",
    source: "layard",
  },
  "fa-vorlauf": {
    id: "fa-vorlauf",
    shortLabel: "Vorlauf-Behauptung",
    text: "Ich hatte das mit drei Wochen Vorlauf angekündigt, beim letzten Mal.",
    source: "layard",
  },
};

/**
 * Welche Angriffs-Phrasen der jeweilige Gegner sicher kontern kann.
 * Brust kontert alle linkischen Eigenversuche — aber NICHT die
 * Bodo/Helka-Spezialitäten (blinde Flecken). Vossbeck dito.
 */
export const BRUST_KNOWS_ATTACKS: ReadonlySet<string> = new Set<string>([
  "fa-bitte",
  "fa-hausflur",
  "fa-anlage3",
  "fa-sechs-wochen",
  "fa-protokoll",
  "fa-vorlauf",
]);
export const VOSSBECK_KNOWS_ATTACKS: ReadonlySet<string> = new Set<string>([
  "fa-bitte",
  "fa-hausflur",
  "fa-anlage3",
  "fa-sechs-wochen",
  "fa-protokoll",
  "fa-vorlauf",
]);

/** Konter-Replik, die der Gegner sagt, wenn er Layards Angriff abwehrt. */
export const ATTACK_COUNTER_LINES: Record<
  string,
  { brust: string; vossbeck: string }
> = {
  "fa-bitte": {
    brust:
      "„Bitte“ ist kein Vorgang, Bewohner Worag. Schwächer geht es nicht.",
    vossbeck:
      "„Bitte“ ist keine Erwiderung. Notiert als Versäumnis.",
  },
  "fa-hausflur": {
    brust:
      "Die Hausflurliste führe nicht ich, Worag. Versuchen Sie's bei Kowalk. Ein anderes Mal.",
    vossbeck:
      "Hausflurreinigung ist Sektor-Akte, nicht meine. Weiter.",
  },
  "fa-anlage3": {
    brust:
      "Anlage 3 ist seit 94 außer Kraft. Hätten Sie nachschlagen können.",
    vossbeck:
      "Anlage 3 ist überholt. Ich verwalte Anlage 5. Weiter.",
  },
  "fa-sechs-wochen": {
    brust:
      "Sechs Wochen sind eine bewohnerseitige Frist. Mich bindet das nicht.",
    vossbeck:
      "Fristen, die mich nicht binden, binden mich nicht. Weiter.",
  },
  "fa-protokoll": {
    brust:
      "Welches Protokoll? Datum? Aktenzeichen? Eben. So macht man das nicht.",
    vossbeck:
      "Behaupten Sie ein Protokoll, legen Sie es vor. Sonst: weiter.",
  },
  "fa-vorlauf": {
    brust:
      "Drei Wochen ohne Aushang sind null Wochen mit Aushang. Schwach.",
    vossbeck:
      "Vorlauf ohne Eintrag ist kein Vorlauf. Weiter.",
  },
};

/** Sichtbare Konter-Replik bauen. */
export function buildOpponentCounterLine(
  opponent: "brust" | "vossbeck",
  attackId: string,
): string {
  const specific = ATTACK_COUNTER_LINES[attackId];
  if (specific) return specific[opponent];
  return opponent === "brust"
    ? "Die kenne ich, Bewohner Worag. So frisst Sie der Herr Vossbeck zum Frühstück."
    : "Bewohner Worag. Diese Phrase liegt in meinem Aktendeckel. Weiter.";
}

/** Lookup für Angriffsphrasen (echt ODER linkisch). */
export function getAttack(id: string): AttackPhrase | undefined {
  return ATTACK_PHRASES[id] ?? FICTIONAL_ATTACKS[id];
}

/** Weiß der Gegner, wie er diese Angriffsphrase kontert? */
export function opponentCounters(
  opponent: "brust" | "vossbeck",
  attackId: string,
): boolean {
  const known =
    opponent === "brust" ? BRUST_KNOWS_ATTACKS : VOSSBECK_KNOWS_ATTACKS;
  return known.has(attackId);
}
