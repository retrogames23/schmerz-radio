/**
 * Bürokratie-Duell — „Phrasen-Dreschen" (Akt I, Kantine 3602).
 *
 * Reines Daten-Modul: enthält den Korpus aller Phrasen und Konter, die
 * an Brusts Tresen und in Vossbecks Endrunde verwendet werden. Die
 * Mechanik des Duells (Runden, Tally, Lernen) lebt in den Dialog-Bäumen
 * `cafeteriaTrainingA/B/C` und `vossbeckDuel` — KEIN eigenes Overlay.
 *
 * Was diese Datei liefert:
 *  - PHRASES (Brust- + Vossbeck-Angriffsphrasen)
 *  - COUNTERS (Layards Konter, landen im Phrasenbuch)
 *  - ATTACK_PHRASES (Layards eigene Angriffsphrasen, gelernt von Bodo/Helka)
 *  - FICTIONAL_ATTACKS (linkische Eigenversuche, die der Gegner immer kontert)
 *  - ATTACK_COUNTER_LINES (die Konter-Repliken des Gegners auf Layard-Angriffe)
 *  - opponentCounters / getCounter / getPhrase / getAttack
 *
 * Mechanik (umgesetzt in Dialog-Bäumen):
 *  - Brust greift mit einer Phrase an → Spieler wählt aus 4 Kontern.
 *    Treffer = Punkt für Layard. Fehler = Brust liefert den richtigen
 *    Konter NACH, und der Spieler kann ihn in sein Phrasenbuch
 *    aufnehmen (das ist die EINZIGE Lernquelle im Duell selbst — durch
 *    falsches Raten lernt Layard NICHTS).
 *  - In Layards Angriffsrunde wirft er selbst eine Phrase. Kennt der
 *    Gegner sie nicht → Gegner stottert sichtbar (Treffer). Sonst
 *    kontert er souverän (Fehler).
 *
 * Alle Strings sind ganze Sätze, i18n-konform, keine Konkatenation.
 */

/** Eine Behörden-Phrase, mit der ein Gegner angreift. */
export interface Phrase {
  /** Eindeutige ID, z.B. "p-immer-so". */
  id: string;
  /** Kurze Bezeichnung („Tradition", „Stapel-Bluff" …). */
  shortLabel: string;
  /** Wörtliche Phrase, wie sie der Gegner sagt. */
  text: string;
}

/**
 * Ein Konter — Layards schlagfertige Antwort. Beat-Liste sagt, welche
 * Phrasen-IDs er entwertet. Wird im Phrasenbuch gesammelt.
 */
export interface Counter {
  /** Eindeutige ID, z.B. "c-immer-so". */
  id: string;
  /** Kurze Bezeichnung für das Phrasenbuch. */
  shortLabel: string;
  /** Wortlaut des Konters. */
  text: string;
  /** Phrasen-IDs, die dieser Konter humorvoll erledigt. */
  beats: string[];
  /** Optionaler Lernhinweis fürs Phrasenbuch. */
  learnHint?: string;
}

/** Antwort-Option, die das Overlay anzeigt. */
export interface DuelCounter {
  text: string;
  /** ID des Konters (in COUNTERS oder FICTIONAL_COUNTERS). */
  counterId: string;
  /** Wird aus der Runden-Definition berechnet. */
  correct: boolean;
}

export interface DuelRound {
  id: string;
  /** Default: "opponentAttacks" (Brust/Vossbeck wirft, Layard kontert). */
  kind?: RoundKind;
  /** Wer eröffnet die Runde — Brust (Training) oder Vossbeck (Endgame). */
  opponent: "brust" | "vossbeck";
  /** Phrase, mit der der Gegner angreift. */
  attackPhraseId: string;
  /** Wörtliche Eröffnung des Gegners. */
  opening: string;
  /**
   * Vorgesehene Antwortoptionen für diese Runde — IDs aus COUNTERS.
   * Genau einer davon hat `beats.includes(attackPhraseId)`. Die übrigen
   * sind echte, aber unpassende Konter — sie klingen plausibel, treffen
   * aber nicht.
   */
  counterOptions: string[];
  /** Reaktion des Gegners auf einen Treffer. */
  onHit: string;
  /** Reaktion des Gegners auf einen Fehlschuss (liefert den Konter nach). */
  onMiss: string;
  /** Optionaler Kowalk-Aside (nur Trainingsduelle). */
  kowalkAside?: string;
}

// ──────────────────────────────────────────────────────────────────
// PHRASEN-KORPUS (Angriffe)
// ──────────────────────────────────────────────────────────────────

export const PHRASES: Record<string, Phrase> = {
  // Trainingsphrasen — die Brust standardmäßig wirft.
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
  // Reine Ablenker — klingen plausibel, treffen aber keine Phrase aus
  // diesem Korpus. Werden als „echte aber unpassende" Optionen genutzt.
  "c-vorschriften": {
    id: "c-vorschriften",
    shortLabel: "„Trotzdem gern essen“",
    text: "Verstehe ich. Trotzdem würde ich gern essen.",
    beats: [],
    learnHint:
      "Charmant entwaffnend — aber nur, wenn die andere Seite mit Vorschriften kommt.",
  },
  "c-naechste-woche": {
    id: "c-naechste-woche",
    shortLabel: "„Stempel auf Vordermann“",
    text: "Gut. Bringen Sie bis dahin Ihren Stempel auf Vordermann.",
    beats: [],
    learnHint:
      "Gegen Vertröstungen auf „nächste Woche“. Verschiebt die Bringschuld zurück.",
  },
};

// ──────────────────────────────────────────────────────────────────
// LEGACY-ALIASE
// Der Rest des Codes greift historisch auf `PARAGRAPHS` / `Paragraph`
// zu. Damit nichts bricht, exportieren wir die Konter-Tabelle unter den
// alten Namen weiter — semantisch sind das jetzt Konter, keine §§ mehr.
// ──────────────────────────────────────────────────────────────────
export const PARAGRAPHS = COUNTERS;
export type Paragraph = Counter;

/**
 * Layards eigene linkische Antwortversuche — Pendant zu Guybrushs
 * schlechten Beleidigungen. Klingen plausibel, schlagen aber niemals
 * eine Phrase. Liegen ab Spielstart implizit im Antwort-Pool, ohne im
 * Phrasenbuch zu erscheinen.
 */
export const FICTIONAL_COUNTERS: Record<string, Counter> = {
  "f-paragraphenreiterei": {
    id: "f-paragraphenreiterei",
    shortLabel: "Verdrucktes Jurist-Spiel",
    text: "Gemäß Aushang vier Punkt zwei wäre das aber sehr wohl mein gutes Recht.",
    beats: [],
  },
  "f-bitte": {
    id: "f-bitte",
    shortLabel: "Höflichkeit",
    text: "Bitte. Es wäre wirklich wichtig.",
    beats: [],
  },
  "f-resonanz": {
    id: "f-resonanz",
    shortLabel: "Resonanz-Geraune",
    text: "Ich höre da etwas — die Resonanz hat heute eine andere Frequenz.",
    beats: [],
  },
  "f-warm": {
    id: "f-warm",
    shortLabel: "Schlechter Smalltalk",
    text: "Heute ist es ja besonders warm hier hinten, oder?",
    beats: [],
  },
  "f-uhr": {
    id: "f-uhr",
    shortLabel: "Uhr-Bemerkung",
    text: "Schauen Sie auf die Uhr — wir sollten das jetzt durchziehen.",
    beats: [],
  },
  "f-vossbeck": {
    id: "f-vossbeck",
    shortLabel: "Vossbeck-Drohung",
    text: "Wenn das so weitergeht, sage ich Vossbeck Bescheid.",
    beats: [],
  },
  "f-handschuhe": {
    id: "f-handschuhe",
    shortLabel: "Handschuh-Hinweis",
    text: "Vergessen Sie nicht die Handschuhe bei der Ausgabe.",
    beats: [],
  },
  "f-vorlauf": {
    id: "f-vorlauf",
    shortLabel: "Vorlauf-Behauptung",
    text: "Ich hatte das mit drei Wochen Vorlauf angekündigt.",
    beats: [],
  },
};

// Legacy alias — alter Code/Notebook greift über diesen Namen zu.
export const FICTIONAL_PARAGRAPHS = FICTIONAL_COUNTERS;

// ──────────────────────────────────────────────────────────────────
// ANGRIFFS-PHRASEN (Layard wirft sie — Typ-B-Runden)
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
  /** Von wem hat Layard die Phrase. */
  source: "bodo" | "helka" | "layard";
  /** Lernhinweis fürs Phrasenbuch. */
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
      "Bodo hat Brust damit zum Schwitzen gebracht. Nur wer keinen Vorgesetzten holen will, kennt keinen Konter.",
  },
  "a-tuerschild-helka": {
    id: "a-tuerschild-helka",
    shortLabel: "„Ihr Türschild sagt anderes“",
    text: "Erstaunlich. Ihr eigenes Türschild sagt das genaue Gegenteil von dem, was Sie gerade behaupten.",
    source: "helka",
    learnHint:
      "Helkas Klassiker aus der Bibliotheks-Zeit. Schlägt jeden, der noch nie auf sein eigenes Türschild geguckt hat.",
  },
};

/**
 * Layards eigene linkische Angriffsversuche — analog zu den linkischen
 * Kontern. Liegen ab Spielstart implizit im Pool und werden vom Gegner
 * IMMER souverän gekontert (kein Treffer).
 */
export const FICTIONAL_ATTACKS: Record<string, AttackPhrase> = {
  "fa-bitte": {
    id: "fa-bitte",
    shortLabel: "Höflichkeit",
    text: "Bitte. Es wäre wirklich wichtig für mich.",
    source: "layard",
  },
  "fa-warm": {
    id: "fa-warm",
    shortLabel: "Smalltalk",
    text: "Heute ist es hier hinten besonders warm, finden Sie nicht?",
    source: "layard",
  },
  "fa-vorlauf": {
    id: "fa-vorlauf",
    shortLabel: "Vorlauf-Behauptung",
    text: "Ich hatte das mit drei Wochen Vorlauf angekündigt, beim letzten Mal.",
    source: "layard",
  },
  "fa-resonanz": {
    id: "fa-resonanz",
    shortLabel: "Resonanz-Geraune",
    text: "Die Resonanz hat heute eine andere Frequenz. Hören Sie das nicht?",
    source: "layard",
  },
};

/**
 * Welche Angriffs-Phrasen der jeweilige Gegner sicher kontern kann.
 * Brust kontert seine eigenen Schulungsfälle und alle linkischen
 * Versuche — aber NICHT die Bodo/Helka-Spezialitäten (das sind seine
 * Schwachstellen, an denen er beide bereits einmal verloren hat).
 * Vossbeck hat von Brust nachgelernt, aber dieselben blinden Flecken.
 */
export const BRUST_KNOWS_ATTACKS: ReadonlySet<string> = new Set<string>([
  "fa-bitte",
  "fa-warm",
  "fa-vorlauf",
  "fa-resonanz",
]);
export const VOSSBECK_KNOWS_ATTACKS: ReadonlySet<string> = new Set<string>([
  "fa-bitte",
  "fa-warm",
  "fa-vorlauf",
  "fa-resonanz",
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
  "fa-warm": {
    brust: "Das Wetter steht heute nicht zur Verhandlung. Nächste Phrase.",
    vossbeck: "Das Klima im Sektor ist nicht meine Zuständigkeit. Weiter.",
  },
  "fa-vorlauf": {
    brust: "Drei Wochen ohne Aushang sind null Wochen mit Aushang. Schwach.",
    vossbeck: "Vorlauf ohne Eintrag ist kein Vorlauf. Weiter.",
  },
  "fa-resonanz": {
    brust:
      "Ich höre nichts. Und was ich nicht höre, das ist auch kein Argument.",
    vossbeck:
      "Resonanz ist eine Frage für die Leitstelle. Nicht für diesen Tresen.",
  },
};

/** Generische Konter-Replik des Gegners auf eine echte, aber bekannte Angriffsphrase. */
const GENERIC_ATTACK_COUNTER = {
  brust: "Die kenne ich, Bewohner Worag. So frisst Sie der Herr Vossbeck zum Frühstück.",
  vossbeck:
    "Bewohner Worag. Diese Phrase liegt in meinem Aktendeckel. Weiter.",
};

/** Wenn der Gegner KEINEN Konter kennt — sichtbarer Treffer für Layard. */
const BLINDSPOT_HIT_LINE = {
  brust:
    "(Brust hält inne. Er schaut zur Seite. Er hat sichtlich keine Antwort parat.) … das … das müsste ich erst nachschlagen.",
  vossbeck:
    "(Vossbeck legt den Bleistift langsam ab. Zum ersten Mal.) … hm. Das ist … nicht in meinem Aktendeckel.",
};

/** Sichtbare Konter-Replik bauen. */
export function buildOpponentCounterLine(
  opponent: "brust" | "vossbeck",
  attackId: string,
): string {
  const specific = ATTACK_COUNTER_LINES[attackId];
  if (specific) return specific[opponent];
  return GENERIC_ATTACK_COUNTER[opponent];
}

/** Sichtbare Treffer-Replik bauen (Gegner stutzt). */
export function buildOpponentBlindspotLine(
  opponent: "brust" | "vossbeck",
): string {
  return BLINDSPOT_HIT_LINE[opponent];
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

/**
 * Antwort-Optionen für eine Typ-B-Runde bauen: alle wirklich gelernten
 * Angriffsphrasen + bis zu 4 Slots gesamt, aufgefüllt mit linkischen
 * Eigenversuchen.
 */
export interface LayardAttackOption {
  attackId: string;
  text: string;
  /** Trifft? (= Gegner kennt keinen Konter) */
  hits: boolean;
  /** Aus Layards Phrasenbuch (vs. linkischer Eigenversuch). */
  learned: boolean;
}

export function buildLayardAttackOptions(
  opponent: "brust" | "vossbeck",
  learnedAttackIds: ReadonlySet<string>,
): LayardAttackOption[] {
  const TARGET = 4;
  const opts: LayardAttackOption[] = [];
  const used = new Set<string>();
  // 1) Alle wirklich gelernten Angriffsphrasen einbauen.
  for (const id of learnedAttackIds) {
    const ap = ATTACK_PHRASES[id];
    if (!ap || used.has(id)) continue;
    opts.push({
      attackId: id,
      text: ap.text,
      hits: !opponentCounters(opponent, id),
      learned: true,
    });
    used.add(id);
    if (opts.length >= TARGET) break;
  }
  // 2) Mit linkischen Eigenversuchen auffüllen.
  const fictional = shuffleArr(Object.values(FICTIONAL_ATTACKS));
  for (const fa of fictional) {
    if (opts.length >= TARGET) break;
    if (used.has(fa.id)) continue;
    opts.push({
      attackId: fa.id,
      text: fa.text,
      hits: !opponentCounters(opponent, fa.id),
      learned: false,
    });
    used.add(fa.id);
  }
  return shuffleArr(opts);
}

function shuffleArr<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Phrase nach ID (für Opening-Anzeige etc.). */
export function getPhrase(id: string): Phrase | undefined {
  return PHRASES[id];
}

/** Konter-Lookup — findet echte UND linkische. */
export function getCounter(id: string): Counter | undefined {
  return COUNTERS[id] ?? FICTIONAL_COUNTERS[id];
}

/** Legacy-Alias — alter Code ruft das so. */
export function getParagraph(id: string): Counter | undefined {
  return getCounter(id);
}

// ──────────────────────────────────────────────────────────────────
// RUNDEN-POOLS
// ──────────────────────────────────────────────────────────────────

/** Trainingsrunden gegen Brust — alltägliche Phrasen-Scharmützel. */
export const TRAINING_ROUNDS: DuelRound[] = [
  {
    id: "training-tradition",
    opponent: "brust",
    attackPhraseId: "p-immer-so",
    opening:
      "Bewohner Worag. Bevor Sie fragen: Das haben wir hier schon immer so gemacht.",
    counterOptions: ["c-immer-so", "c-vorschriften", "c-formsache", "c-naechste-woche"],
    onHit:
      "(Pause.) Hm. Das … sieht er ihm tatsächlich an. Setzen wir das ad acta.",
    onMiss:
      "Das war schwach, Herr Worag. So frisst Sie der Herr Vossbeck zum Frühstück.",
    kowalkAside:
      "Das hätte ich auch nicht besser sagen können, Worag. Schreib's dir hinter die Ohren.",
  },
  {
    id: "training-stapel",
    opponent: "brust",
    attackPhraseId: "p-stapel",
    opening:
      "Ihr Vorgang liegt ganz unten auf meinem Stapel. So ist das nun mal.",
    counterOptions: ["c-stapel", "c-termin", "c-naechste-woche", "c-vorschriften"],
    onHit:
      "(Brust schaut auf den Stapel. Dann auf Layard. Dann wieder auf den Stapel.) Das … kann man so sehen.",
    onMiss:
      "Bewohner Worag. Ihre Erwiderung trägt nicht. Notieren tue ich das. Sie nicht.",
    kowalkAside: "Last des ganzen Hauses. Den nehm ich mir auch mit.",
  },
  {
    id: "training-nichtzustaendig",
    opponent: "brust",
    attackPhraseId: "p-nicht-zustaendig",
    opening:
      "Dafür bin ich nicht zuständig. Ich gebe nur die Rationen aus.",
    counterOptions: ["c-nicht-zustaendig", "c-termin", "c-formsache", "c-vorgesetzte"],
    onHit:
      "(Brust dreht sich unwillkürlich zu seinem Türschild um.) Hm. Das … ist tatsächlich ungünstig formuliert.",
    onMiss:
      "Das war kein Konter, das war ein Verlegenheitsgeräusch. Bei Vossbeck geht damit das Licht aus.",
    kowalkAside: "Sein Türschild liest er nie. Du jetzt umso mehr.",
  },
  {
    id: "training-termin",
    opponent: "brust",
    attackPhraseId: "p-termin",
    opening:
      "Für so etwas bräuchten Sie eigentlich einen Termin.",
    counterOptions: ["c-termin", "c-nicht-zustaendig", "c-formsache", "c-vorschriften"],
    onHit:
      "(Brust zieht das Terminbuch hervor, schaut hinein, klappt es zu.) Auch wieder wahr.",
    onMiss:
      "Schwach, Worag. Sehr schwach. Ich gebe heute nichts mehr aus, das so dürftig vorgebracht wird.",
    kowalkAside: "Ich hätte ihm das Terminbuch geholt. Nimm's mit.",
  },
  {
    id: "training-formsache",
    opponent: "brust",
    attackPhraseId: "p-formsache",
    opening:
      "Letzten Endes ist das alles eine reine Formsache.",
    counterOptions: ["c-formsache", "c-stapel", "c-vorgesetzte", "c-vorschriften"],
    onHit:
      "(Brust greift unwillkürlich nach dem Formularblock. Hält inne.) Das war jetzt … ungeschickt von mir.",
    onMiss:
      "Bewohner Worag, im Ernst. Ich kann das nicht durchgehen lassen. So lacht Vossbeck Sie aus der Tür.",
    kowalkAside: "Wer „Formsache“ sagt, hat sie schon verloren.",
  },
  {
    id: "training-vorgesetzte",
    opponent: "brust",
    attackPhraseId: "p-vorgesetzte",
    opening:
      "Das müsste ich eigentlich erst meinem Vorgesetzten vorlegen.",
    counterOptions: ["c-vorgesetzte", "c-termin", "c-nicht-zustaendig", "c-naechste-woche"],
    onHit:
      "(Brust schaut sich um. Niemand da, den er holen könnte.) Hm. Gut. Nächste Runde.",
    onMiss:
      "(Brust lächelt knapp.) Das, Worag, war kein Argument. Das war ein Achselzucken in Wörtern.",
    kowalkAside: "Den Vorgesetzten hat Brust seit Monaten nicht gesehen.",
  },
];

/**
 * Endgame-Runden gegen Vossbeck — derselbe Bautyp wie Brusts Phrasen,
 * aber neu formuliert. Die korrekten Konter stammen aus dem Brust-Pool:
 * Wer im Training gelernt hat, schlagfertig zu sein, kann diese Konter
 * sinngemäß auch auf Vossbecks vornehmere Variante anwenden.
 */
export const ENDGAME_ROUNDS: DuelRound[] = [
  {
    id: "endgame-tradition",
    opponent: "vossbeck",
    attackPhraseId: "pE-tradition",
    opening:
      "Bewohner Worag. Bevor wir anfangen: Wir halten uns hier an Verfahren, die sich seit Jahrzehnten bewährt haben.",
    counterOptions: ["c-immer-so", "c-vorschriften", "c-formsache", "c-termin"],
    onHit:
      "(Vossbeck hebt langsam den Kopf.) Hm. Das … ist eine Beobachtung, die ich nur schwer entkräften kann. Weiter.",
    onMiss:
      "Worag. »Das sieht man dem Sektor auch an« wäre die korrekte Replik gewesen. Sie kennen sie aus dem Training. Sie haben sie nicht eingesetzt.",
  },
  {
    id: "endgame-stapel",
    opponent: "vossbeck",
    attackPhraseId: "pE-stapel-hoheit",
    opening:
      "Über Vollmacht 4317 wird heute nicht entschieden. Setzen Sie sich auf meinen Stapel.",
    counterOptions: ["c-stapel", "c-vorgesetzte", "c-termin", "c-vorschriften"],
    onHit:
      "(Vossbeck schaut auf seinen Stapel. Glättet ihn unwillkürlich.) Sehr wohl. Last des Hauses. Notiert.",
    onMiss:
      "Worag. »Dann trägt er wenigstens die Last des ganzen Hauses« — Brust hat Ihnen das gezeigt. Sie haben es nicht gespielt.",
  },
  {
    id: "endgame-vorgesetzter",
    opponent: "vossbeck",
    attackPhraseId: "pE-vorgesetzten-bluff",
    opening:
      "Einen Vorgang dieser Tragweite werde ich der Bewohnervertretungs-Aufsicht vorlegen müssen.",
    counterOptions: ["c-vorgesetzte", "c-nicht-zustaendig", "c-stapel", "c-formsache"],
    onHit:
      "(Lange Pause. Vossbeck legt den Bleistift parallel zum Aktendeckel.) Hm. Niemand will diese Aufsicht wirklich holen. Auch ich nicht. — Vollmacht 4317 wird freigegeben.",
    onMiss:
      "Worag. »Holen Sie ihn. Ich warte« hätte mich heute beinahe in Verlegenheit gebracht. Sie haben es nicht gespielt. Schade.",
  },
];

// ──────────────────────────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────────────────────────

/**
 * Liefert die korrekte Konter-ID für eine Runde, oder `null`, wenn keine
 * der angebotenen Antworten die Angriffsphrase wirklich schlägt.
 */
export function correctCounterId(round: DuelRound): string | null {
  for (const cid of round.counterOptions) {
    const c = COUNTERS[cid];
    if (c && c.beats.includes(round.attackPhraseId)) return cid;
  }
  return null;
}

/** Resolved counter mit korrekt-Markierung — für die Overlay-Anzeige. */
export function resolveCounters(round: DuelRound): DuelCounter[] {
  const correctId = correctCounterId(round);
  return round.counterOptions.map((cid) => {
    const c = COUNTERS[cid];
    return {
      text: c ? c.text : cid,
      counterId: cid,
      correct: cid === correctId,
    };
  });
}

/**
 * Baut die vier Antwort-Optionen für eine Runde abhängig vom aktuellen
 * Wissensstand des Spielers (Monkey-Island-Logik):
 *
 *  - Wenn der Spieler mindestens einen korrekten Konter (= einen Konter,
 *    der die Angriffsphrase schlägt) bereits gelernt hat, kommt GENAU EINER
 *    davon in die Auswahl. Die übrigen Plätze werden mit unpassenden echten
 *    Kontern + linkischen Eigenversuchen aufgefüllt.
 *  - Wenn nicht, sind alle vier Antworten falsch (Mix aus unpassenden echten
 *    + linkischen). Die Runde ist dann nicht gewinnbar — der Spieler weiß
 *    das nicht und muss raten. Bei Fehlschlag lernt er den korrekten Konter.
 */
export function buildRoundCounters(
  round: DuelRound,
  knownIds: ReadonlySet<string>,
): DuelCounter[] {
  const TARGET = 4;
  // IDs aller Konter, die diese Angriffsphrase laut Datenbank schlagen.
  const correctIds = Object.values(COUNTERS)
    .filter((c) => c.beats.includes(round.attackPhraseId))
    .map((c) => c.id);

  // 1) Korrekten Konter aus den Runden-Optionen wählen — falls bekannt.
  const correctOption = round.counterOptions.find(
    (cid) => correctIds.includes(cid) && knownIds.has(cid),
  );

  const picked: DuelCounter[] = [];
  const usedIds = new Set<string>();

  if (correctOption) {
    const c = COUNTERS[correctOption];
    picked.push({
      text: c ? c.text : correctOption,
      counterId: correctOption,
      correct: true,
    });
    usedIds.add(correctOption);
  }

  // 2) Auffüllen mit unpassenden echten Optionen aus dem Runden-Pool.
  const wrongRealPool = shuffle(
    round.counterOptions.filter(
      (cid) => !correctIds.includes(cid) && !usedIds.has(cid),
    ),
  );
  for (const cid of wrongRealPool) {
    if (picked.length >= TARGET) break;
    const c = COUNTERS[cid];
    if (!c) continue;
    picked.push({ text: c.text, counterId: cid, correct: false });
    usedIds.add(cid);
  }

  // 3) Auffüllen mit linkischen Eigenversuchen.
  const fictionalPool = shuffle(Object.values(FICTIONAL_COUNTERS));
  for (const f of fictionalPool) {
    if (picked.length >= TARGET) break;
    if (usedIds.has(f.id)) continue;
    picked.push({ text: f.text, counterId: f.id, correct: false });
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
  return ENDGAME_ROUNDS.map((r) => ({
    ...r,
    counterOptions: shuffle(r.counterOptions),
  }));
}

/**
 * Baut eine vollständige Trainingssession: 3 Runden, alternierend.
 * Reihenfolge fest: Brust greift an → Layard greift an → Brust greift an.
 * Die Layard-Angriffsrunde wird als „Pseudo-Runde" eingeschoben — sie
 * hat keine counterOptions, sondern wird vom Overlay anders gerendert.
 */
export function buildTrainingSession(): DuelRound[] {
  const real = pickRounds(TRAINING_ROUNDS, 2);
  const layardRound: DuelRound = {
    id: "training-layard-attack",
    kind: "layardAttacks",
    opponent: "brust",
    attackPhraseId: "",
    opening:
      "So, Bewohner Worag. Jetzt sind Sie dran. Werfen Sie eine Phrase. Ich kontere — oder eben nicht.",
    counterOptions: [],
    onHit:
      "(Brust hält sichtbar inne. Schaut zur Seite. Sagt erstmal nichts.) … das müsste ich erst nachschlagen, Bewohner Worag.",
    onMiss:
      "(Brust nickt knapp.) Bekannt. So frisst Sie der Herr Vossbeck zum Frühstück.",
    kowalkAside:
      "Solche Phrasen lernst du nicht bei Brust, Worag. Lass dir was zeigen — von Leuten, die Brust selbst schon mal kleingekriegt haben.",
  };
  return [real[0], layardRound, real[1] ?? real[0]];
}

/**
 * Vollständige Endgame-Session: 3 Runden, alternierend.
 * Vossbeck greift an → Layard greift an → Vossbeck greift an.
 * Die Mittelrunde ist OHNE Bodo/Helka-Phrasen nicht zu treffen — das
 * ist Absicht: wer nur bei Brust trainiert hat, kommt hier nicht durch.
 */
export function buildEndgameSession(): DuelRound[] {
  const real = ENDGAME_ROUNDS.map((r) => ({
    ...r,
    counterOptions: shuffle(r.counterOptions),
  }));
  const layardRound: DuelRound = {
    id: "endgame-layard-attack",
    kind: "layardAttacks",
    opponent: "vossbeck",
    attackPhraseId: "",
    opening:
      "Bewohner Worag. Die zweite Runde gehört Ihnen — Aktenordnung. Werfen Sie. Ich kontere.",
    counterOptions: [],
    onHit:
      "(Vossbeck legt den Bleistift langsam ab — zum ersten Mal an diesem Tag.) … hm. Das … ist nicht in meinem Aktendeckel.",
    onMiss:
      "Bewohner Worag. Diese Phrase liegt seit Jahren in meinem Aktendeckel. Weiter.",
  };
  return [real[0], layardRound, real[1] ?? real[0]];
}

function pickRounds(pool: readonly DuelRound[], n: number): DuelRound[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length)).map((r) => ({
    ...r,
    counterOptions: shuffle(r.counterOptions),
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
  trainingTitle: "Phrasen-Dreschen · Trainingsfall · Tresen Schicht B",
  endgameTitle: "Phrasen-Dreschen · Vollmacht 4317 · Endrunde",
  trainingSubtitle:
    "Brust feuert eine Behörden-Phrase, Sie kontern. Zwei Treffer — Trainingsfall gewonnen. Drei Fehler — Brust schließt für heute.",
  endgameSubtitle:
    "Vossbeck wirft neue Phrasen — die Konter aus dem Training passen sinngemäß. Drei Treffer in Folge: Vollmacht frei. Drei Fehler: Vorgang verloren.",
  hitsLabel: "Treffer",
  missesLabel: "Fehler",
  roundLabel: "Runde",
  prompt: "Ihre Erwiderung:",
  learnedBadge: "📓 gelernt",
  unlearnedBadge: "🔒 nicht gelernt",
  unlearnedHint:
    "Dieser Konter steht noch nicht in Ihrem Phrasenbuch. Lernen Sie ihn in einem anderen Trainingsduell — oder hören Sie genauer zu, wenn andere Bewohner über Brust meckern.",
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
    "„Bewohner Worag. Schlagfertigkeit tragfähig. Trainingsfall abgeschlossen.“",
    "Im Hintergrund Kowalk, halblaut: „Du wirst besser, Worag.“",
  ],
  trainingDefeatHeadline: "Brust schließt die Ausgabezone.",
  trainingDefeatLines: [
    "Brust hebt langsam den Kopf. Seine Mimik wird wieder steif.",
    "„Bewohner Worag. Ihre Erwiderungen tragen nicht. Trainingsfall verloren.“",
    "„Bitte verlassen Sie die Ausgabezone. Sie können es zu einem späteren Zeitpunkt erneut versuchen.“",
  ],
  endgameVictoryHeadline: "Vossbeck kapituliert. Vollmacht 4317 anerkannt.",
  endgameVictoryLines: [
    "Vossbeck legt die Vollmacht sehr sorgfältig auf den Tresen. Glättet sie.",
    "„Bewohner Worag. Ihre Schlagfertigkeit ist … in sich schlüssig. Die Ration wird ausgegeben.“",
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
  paragraphLearnedToast: (c: Counter) =>
    `📓 Neuer Konter gelernt: ${c.shortLabel}. ${c.learnHint ?? ""}`,
  layardAttackPrompt: "Ihre Phrase:",
  layardAttackHint:
    "Wählen Sie eine Phrase aus Ihrem Phrasenbuch. Linkische Eigenversuche wird der Gegner souverän kontern.",
  layardAttackNoLearned:
    "Sie haben noch keine eigene Angriffsphrase. Lassen Sie sich von erfahrenen Bewohnern eine zeigen — Brust hat blinde Flecken.",
};