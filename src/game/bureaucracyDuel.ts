/**
 * Bürokratie-Duell — „Amtliches Phrasen-Dreschen" (Akt I, Kantine 3602).
 *
 * Adaption des Monkey-Island-Schwertkampfs auf passiv-aggressive
 * Behörden-Phrasen statt trockener Paragraphen: Brust greift mit einem
 * typischen Amtsschimmel-Satz an, Layard kontert mit einer
 * schlagfertigen System-Ironie. Pro neu gelerntem Konter wächst sein
 * „Phrasenbuch". Drei Trainingssiege in Folge → Vossbeck nimmt ihn an.
 *
 * Mechanik (analog Monkey Island):
 *  - Jede Runde wirft der Gegner eine Phrase ins Feld.
 *  - Layard wählt aus 4 Antwortoptionen.
 *  - Genau eine Antwort ist der „passende" Konter (sein `beats`-Feld
 *    enthält die Phrasen-ID). Diese Antwort kann Layard NUR wählen,
 *    wenn er den Konter bereits gelernt hat — sonst gibt es nur
 *    unpassende Konter und eigene linkische Versuche im Pool.
 *  - Bei korrekter Antwort lernt er den Konter sofort (falls neu).
 *  - Bei falscher Antwort liefert Brust den richtigen Konter selbst
 *    nach — Layard übernimmt ihn in sein Phrasenbuch. So kann er das
 *    Duell auch rein durch Verlieren-und-Lernen meistern.
 *  - Im Endgame gegen Vossbeck sind die Phrasen NEU, aber die
 *    korrekten Konter stammen aus Brusts Trainingspool — ein gelernter
 *    Konter passt sinngemäß auch auf eine neue Phrase.
 *
 * Alle Strings sind ganze Sätze in einem Daten-Modul — i18n-konform,
 * keine String-Konkatenation, keine JSX-Schnipsel.
 */

export type DuelMode = "training" | "endgame";

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
      "Bewohner Worag. Die richtige Antwort wäre gewesen: »Das sieht man dem Sektor auch an.« Schreiben Sie sich das auf.",
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
      "Falsch, Worag. Hätten Sie gesagt »Dann trägt er wenigstens die Last des ganzen Hauses« — hätte ich nicken müssen. Notieren Sie das.",
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
      "Sie hätten gesagt: »Erstaunlich, auf Ihrem Türschild steht das Gegenteil.« — und ich hätte aufstehen müssen. Lernen Sie das.",
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
      "Sie hätten antworten müssen: »Den hätte ich gern — bei jemandem, der zuständig ist.« — Notieren Sie das, Worag.",
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
      "Sie hätten geantwortet: »Wunderbar. Dann füllen Sie sie doch eben aus.« — Das hätte gesessen. Schreiben Sie's auf.",
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
      "Bewohner Worag — Sie hätten gesagt: »Wunderbar. Holen Sie ihn. Ich warte.« Das ist die korrekte Replik. Merken Sie sich das.",
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
};