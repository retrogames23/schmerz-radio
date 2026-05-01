/**
 * Daten und Mechanik für das mehrstufige Bürokratie-Duell (Akt I, Kantine 3602).
 *
 * Aufbau (inspiriert vom Schwertkampf in Monkey Island):
 *
 *   1. TRAININGS-DUELLE gegen Brust am Tresen.
 *      Brust trägt einen fiktiv-absurden Kantinen-Fall vor und kontert
 *      Layards Antworten paragraphengestützt. Layard kann nur dann
 *      korrekt erwidern, wenn er den nötigen Paragraphen schon GELERNT
 *      hat. Bei einer Niederlage zitiert Brust siegestrunken den
 *      Paragraphen, der gewonnen hätte — und Layard schreibt ihn ins
 *      Notizbuch. Nach drei Siegen IN FOLGE darf er den Bürokratiemeister
 *      Vossbeck herausfordern.
 *
 *   2. ENDGAME-DUELL gegen Oberinspektor Vossbeck.
 *      Es geht um Vollmacht 4317 (echter Fall). Vossbeck zitiert
 *      dieselben Paragraphen, die Layard im Training gelernt hat — aber
 *      gegen ihn. Layard gewinnt mit den gelernten Widersprüchen
 *      zwischen den Paragraphen.
 *
 * Alle narrativen Strings sind ganze Sätze in einem Daten-Modul —
 * i18n-konform, keine String-Konkatenation, keine JSX-Schnipsel.
 */

/* ─────────────────────────────────────────────────────────────
 * Paragraphen-Korpus (Kantinenverordnung E67, fiktiv).
 * Jeder Paragraph hat eine eindeutige ID, einen Kurztitel, den
 * Wortlaut zum Nachlesen und eine Quelle (welche Trainings-Runde
 * Layard ihn lehrt).
 * ───────────────────────────────────────────────────────────── */

export interface Paragraph {
  id: string;
  /** Aktenzeichen-Kurzform, z. B. "§3 Abs. 4". */
  citation: string;
  /** Kurzer beschreibender Titel, ein Satz. */
  title: string;
  /** Volltext, wie er im Notizbuch gelesen wird. Ein Absatz. */
  body: string;
  /** Aus welcher Trainings-Runde Layard ihn gelernt hat. */
  learnedFrom: string;
}

export const PARAGRAPHS: ReadonlyArray<Paragraph> = [
  {
    id: "p1_3",
    citation: "§1 Abs. 3 Schichtübergabeordnung",
    title: "Trockensiegel ersetzt Handzettel-Eintragung.",
    body:
      "Das Trockensiegel der ausgebenden Schicht ersetzt nach §1 Abs. 3 die Handzettel-Eintragung am Tresen, sofern es im oberen rechten Drittel der Vollmacht angebracht ist. Eine zusätzliche Handzettel-Notiz ist verzichtbar.",
    learnedFrom: "siegelMatt",
  },
  {
    id: "p1_5",
    citation: "§1 Abs. 5 Schichtübergabeordnung",
    title: "Mattheit allein begründet keine Zurückweisung.",
    body:
      "Ein Trockensiegel ist nach §1 Abs. 5 erst dann ungültig, wenn ein Bogen des Vereinsnamens vollständig fehlt. Mattheit, Abrieb oder altersbedingte Verblassung sind keine Zurückweisungsgründe.",
    learnedFrom: "siegelMatt",
  },
  {
    id: "p2_5",
    citation: "§2 Abs. 5 Ausweis-Vorrang",
    title: "Empfängerseitig genügt der Bewohner-Ausweis.",
    body:
      "Wird eine Vollmacht auf den Aussteller, nicht auf den Empfänger ausgestellt, genügt empfängerseitig nach §2 Abs. 5 der Bewohner-Ausweis. Eine ausdrückliche Empfängernennung in der Vollmacht ist nicht erforderlich.",
    learnedFrom: "fremdeNummer",
  },
  {
    id: "p3_4",
    citation: "§3 Abs. 4 Schichtübergangsklausel",
    title: "Vollmacht gilt auf angrenzender Schicht weiter.",
    body:
      "Bei Schichtwechsel innerhalb desselben Werktages gilt eine Vollmacht nach §3 Abs. 4 auf der angrenzenden Schicht weiter, sofern sie an demselben Werktag eingereicht wurde. Schichtkürzel A, B und C sind in dieser Hinsicht durchlässig.",
    learnedFrom: "schichtkurz",
  },
  {
    id: "p3_6",
    citation: "§3 Abs. 6 Beschwerdewege",
    title: "B3 ist im Bewohnerheft als Kompensationsration anerkannt.",
    body:
      "B3 wird im Bewohnerheft nach §3 Abs. 6 ausdrücklich als Kompensationsration geführt. Ein Marteau-Vermerk auf der Vollmacht zählt als ärztliches Indiz im Sinne von §5 Abs. 2 lit. b.",
    learnedFrom: "kompensation",
  },
  {
    id: "p4_9",
    citation: "§4 Abs. 9 Restposten-Klausel",
    title: "Ausgebucht ist nicht entsorgt.",
    body:
      "Restposten in Originalverpackung sind nach §4 Abs. 9 bis zur nächsten Schichtinventur ausgabefähig, auch wenn die Charge offiziell ausgebucht ist. Ausbuchung bedeutet nicht Entsorgung.",
    learnedFrom: "originalverpackung",
  },
  {
    id: "p5_2",
    citation: "§5 Abs. 2 Ausgabezone",
    title: "Sperrzeit gilt nicht bei laufendem Vorgang.",
    body:
      "Sperrzeiten der Ausgabezone gelten nach §5 Abs. 2 nicht für Vorgänge, die vor Sperrbeginn angelegt wurden. Eine Identitätsgegenzeichnung durch das Tresenpersonal gilt als Vorgangsbeginn.",
    learnedFrom: "sperrzeit",
  },
  {
    id: "p6_4",
    citation: "§6 Abs. 4 Bringschuld der Leitstelle",
    title: "Rückruf nur bei Bringschuld der Leitstelle.",
    body:
      "Ein Rückruf der Leitstelle ist nach §6 Abs. 4 nur bei eigener Bringschuld vorgesehen, nicht bei Vorgängen, die bereits ein Aktenzeichen tragen. Liegt ein Aktenzeichen vor, gilt die Sache als telefonisch freigegeben.",
    learnedFrom: "leitstelle",
  },
  {
    id: "p7_1",
    citation: "§7 Abs. 1 Carbon-Gleichwertigkeit",
    title: "Carbon-Durchschlag ist ausgabegleichwertig.",
    body:
      "Carbon-Durchschläge der Schicht A gelten nach §7 Abs. 1 als ausgabegleichwertig zum Original, sofern auf Lage drei das Trockensiegel lesbar ist. Das Original muss in diesem Fall NICHT vorgelegt werden.",
    learnedFrom: "carbon",
  },
  {
    id: "p8_2",
    citation: "§8 Abs. 2 Aushang-Übersagung",
    title: "Übersagt ist nicht widerrufen.",
    body:
      "Ein älterer Aushang gilt nach §8 Abs. 2 fort, solange er nicht im Wortlaut widerrufen wurde. Eine bloße Übersagung durch einen jüngeren Aushang reicht nicht — der jüngere muss das Wort »widerrufen« ausdrücklich enthalten.",
    learnedFrom: "uebersagt",
  },
];

/** Findet einen Paragraphen — wirft nicht, gibt undefined zurück. */
export function findParagraph(id: string): Paragraph | undefined {
  return PARAGRAPHS.find((p) => p.id === id);
}

/* ─────────────────────────────────────────────────────────────
 * Antwortoptionen und Runden.
 *
 * Eine Counter-Antwort ist GENAU DANN korrekt, wenn:
 *  - sie einen `paragraphId` referenziert, den Layard bereits gelernt
 *    hat (Standard-Trainings-Treffer), ODER
 *  - sie eine `requiresParagraphs`-Liste hat und Layard ALLE diese
 *    Paragraphen kennt (Widerspruchs-Antwort, garantierter Treffer
 *    auch im Endgame).
 *
 * Eine Counter-Antwort ohne `paragraphId` und ohne `requiresParagraphs`
 * ist eine "Bauchgefühl"-Antwort — nie korrekt. Sie wirkt plausibel,
 * aber Brust/Vossbeck kontern jede solche Antwort.
 * ───────────────────────────────────────────────────────────── */

export interface DuelCounter {
  text: string;
  /** Single-Paragraph-Konter. Treffer, sobald Layard ihn gelernt hat. */
  paragraphId?: string;
  /**
   * Widerspruchs-Konter. Treffer NUR, wenn Layard ALLE diese Paragraphen
   * gelernt hat. Trumpft im Endgame Vossbecks Einzelparagraphen.
   */
  requiresParagraphs?: string[];
}

export type DuelTier = "training" | "endgame";

export interface DuelRound {
  id: string;
  tier: DuelTier;
  /** Wer trägt den Fall vor. */
  opponent: "BRUST" | "VOSSBECK";
  /** Eröffnungsplädoyer. Ein paragraphengestützter, fiktiver Kantinenfall. */
  opening: string;
  /** Vier Antwortoptionen — Reihenfolge wird zur Laufzeit gemischt. */
  counters: DuelCounter[];
  /** Reaktion bei Treffer (Single-Paragraph). */
  onHit: string;
  /** Reaktion bei garantiertem Treffer (Widerspruchs-Konter). */
  onCounterHit?: string;
  /** Reaktion bei Fehlversuch. */
  onMiss: string;
  /** Halblauter Hintergrund-Kommentar (Kowalk im Training, niemand im Endgame). */
  asideOnHit?: string;
}

/* ───── Trainings-Runden ────────────────────────────────────── */

export const TRAINING_ROUNDS: ReadonlyArray<DuelRound> = [
  {
    id: "uebersagt",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Stellen wir uns vor: Aushang sieben Punkt eins ist von 1991. Aushang vier Punkt zwei ist von 1996. Bewohner Y reklamiert nach dem alten. Wer kriegt seine Ration?",
    counters: [
      {
        text:
          "Bewohner Y kriegt sie. Übersagt ist nicht widerrufen — der ältere Aushang gilt fort, solange »widerrufen« nicht ausdrücklich im jüngeren steht.",
        paragraphId: "p8_2",
      },
      {
        text: "Bewohner Y geht leer aus. Der ältere Aushang ist Geschichte.",
      },
      {
        text: "Beide Aushänge gelten gleichzeitig — Bewohner Y darf wählen.",
      },
      {
        text: "Frau Bauerfeind aus der Leitstelle entscheidet im Einzelfall.",
      },
    ],
    onHit:
      "Hm. Das ist tatsächlich §8 Absatz zwei. Sie haben recht, Bewohner Worag. Punkt für Sie.",
    onMiss:
      "Falsch. Übersagt IST nicht widerrufen — §8 Absatz zwei. Steht in jeder Schichtmappe. Ich vermerke Ihre Niederlage.",
    asideOnHit:
      "Übersagt ist nicht widerrufen. Hat sie schön gesagt, die Worag.",
  },
  {
    id: "schichtkurz",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Fall: Vollmacht 9982 wird heute morgen in Schicht A vorgelegt, gegengezeichnet, in der Mappe abgelegt. Bewohner Z holt sie nachmittags ab — Schicht B. Was sagt das Regelwerk?",
    counters: [
      {
        text:
          "Schichtübergangsklausel: die Vollmacht gilt auf der angrenzenden Schicht am selben Werktag weiter. Bewohner Z bekommt die Ration.",
        paragraphId: "p3_4",
      },
      {
        text: "Bewohner Z muss morgen in Schicht A wiederkommen.",
      },
      {
        text: "Bewohner Z holt Frau Kowalk dazu — sie war Schicht A.",
      },
      {
        text: "Schichtkürzel sind nur Empfehlungen, keine Vorschriften.",
      },
    ],
    onHit:
      "Korrekt. §3 Absatz vier, Schichtübergangsklausel. Greift bis zum Tagesende. Punkt für Sie.",
    onMiss:
      "Falsch. §3 Absatz vier — Schichtübergangsklausel. Vollmacht gilt am selben Werktag durch. Eine Niederlage mehr.",
    asideOnHit: "Den Schichtübergang hat Brust noch nie freiwillig zitiert.",
  },
  {
    id: "kompensation",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Konstruktiv: B3 ist kein Bewohner-Standardsortiment. Bewohner X hat eine Vollmacht mit Marteau-Vermerk, aber keinen ärztlichen Antrag. Ausgabe oder Ablehnung?",
    counters: [
      {
        text:
          "Ausgabe. B3 ist im Bewohnerheft als Kompensationsration anerkannt — der Marteau-Vermerk gilt als ärztliches Indiz nach Beschwerdewegen-Paragraph.",
        paragraphId: "p3_6",
      },
      { text: "Ablehnung. Erst zur Hausärztin schicken." },
      { text: "Ausgabe nur, wenn Bewohner X selbst kommt — keine Vollmacht." },
      { text: "Ausgabe gegen Quittung am Pneumatikrohr." },
    ],
    onHit:
      "§3 Absatz sechs, Beschwerdewege. Korrekt zitiert — Marteau-Vermerk gilt als Indiz. Punkt für Sie.",
    onMiss:
      "Falsch. §3 Absatz sechs — Beschwerdewege. Marteau-Vermerk IST ein Indiz. Lesen Sie nach.",
  },
  {
    id: "originalverpackung",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Charge sechs-zwei-zwei ist seit März 1996 nicht mehr im Sortiment, ausgebucht. Im Lager liegen aber drei Dosen in Originalverpackung. Bewohner Y verlangt eine. Was tun?",
    counters: [
      {
        text:
          "Ausgabe. Restposten in Originalverpackung sind bis zur nächsten Schichtinventur ausgabefähig — ausgebucht ist nicht entsorgt.",
        paragraphId: "p4_9",
      },
      { text: "Ablehnung. Was ausgebucht ist, ist ausgebucht." },
      { text: "Erst neu einbuchen lassen, dann ausgeben." },
      { text: "Bewohner Y muss in einer anderen Kantine versuchen." },
    ],
    onHit:
      "§4 Absatz neun, Restposten-Klausel. Greift bis zur Inventur. Sie haben recht — Punkt.",
    onMiss:
      "Falsch. §4 Absatz neun — Restposten in Originalverpackung sind ausgabefähig. Schon wieder eine Niederlage.",
    asideOnHit:
      "Restposten-Klausel. Habe ich Brust letzten Monat erklärt. Vergessen.",
  },
  {
    id: "fremdeNummer",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Vollmacht 4419 lautet auf Frau Tessmer, nicht auf den Bewohner, der sie vorlegt. Der Bewohner hat aber seinen Bewohner-Ausweis dabei. Ausgabe?",
    counters: [
      {
        text:
          "Ausgabe. Vollmacht lautet auf den Aussteller, empfängerseitig genügt der Bewohner-Ausweis — Ausweis-Vorrang.",
        paragraphId: "p2_5",
      },
      { text: "Ablehnung. Empfänger muss in der Vollmacht stehen." },
      { text: "Ausgabe nur, wenn der Bewohner Frau Tessmer telefonisch erreicht." },
      { text: "Ausgabe gegen Eintragung in den Handzettel." },
    ],
    onHit:
      "§2 Absatz fünf, Ausweis-Vorrang. Genau das. Punkt für Sie.",
    onMiss:
      "Falsch. §2 Absatz fünf — Ausweis-Vorrang. Vollmacht lautet auf den Aussteller, das wissen Sie als Bewohner.",
  },
  {
    id: "siegelMatt",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Vollmacht hat ein Trockensiegel — aber das B in BEWOHNERVERTRETUNG ist matt, der untere Bogen kaum lesbar. Annahme oder Zurückweisung?",
    counters: [
      {
        text:
          "Annahme. Das Siegel ersetzt die Handzettel-Eintragung — und Mattheit allein begründet keine Zurückweisung, nur ein vollständig fehlender Bogen.",
        requiresParagraphs: ["p1_3", "p1_5"],
      },
      {
        text:
          "Annahme. Mattheit allein ist kein Zurückweisungsgrund — verlangt wird ein vollständig fehlender Bogen.",
        paragraphId: "p1_5",
      },
      { text: "Zurückweisung. Wer matt siegelt, siegelt nicht ordentlich." },
      { text: "Annahme gegen schriftliche Bestätigung der Schicht A." },
    ],
    onHit:
      "§1 Absatz fünf — vollständig fehlender Bogen ist nicht der Fall. Sie haben recht.",
    onCounterHit:
      "Sie haben gleich beide Absätze parat. §1 Absatz drei UND fünf. Das … das ist sauber.",
    onMiss:
      "Falsch. §1 Absatz fünf — Mattheit reicht nicht. Sie verkennen die Lage.",
  },
  {
    id: "sperrzeit",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Bewohner W meldet sich um 13 Uhr 48 am Tresen, Identität wird gegengezeichnet. Um 14 Uhr beginnt die Sperrzeit. Um 14 Uhr 03 verlangt er die Ausgabe. Sperrzeit oder nicht?",
    counters: [
      {
        text:
          "Keine Sperrzeit für ihn. Sperrzeit gilt nicht bei laufendem Vorgang — die Identitätsgegenzeichnung war Vorgangsbeginn.",
        paragraphId: "p5_2",
      },
      { text: "Sperrzeit. 14 Uhr 03 ist nach 14 Uhr." },
      { text: "Sperrzeit, aber Kulanz-Ausgabe möglich." },
      { text: "Sperrzeit. Bewohner W kommt morgen wieder." },
    ],
    onHit:
      "§5 Absatz zwei — Vorgangsbeginn ist die Identitätsgegenzeichnung. Korrekt.",
    onMiss:
      "Falsch. §5 Absatz zwei. Vorgangsbeginn zählt, nicht Ausgabezeitpunkt. Verloren.",
  },
  {
    id: "carbon",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Bewohner Z legt nicht das Original der Vollmacht vor, sondern den Carbon-Durchschlag der Schicht A. Auf Lage drei ist das Trockensiegel klar lesbar. Annahme?",
    counters: [
      {
        text:
          "Annahme. Carbon-Durchschlag ist ausgabegleichwertig, sofern auf Lage drei das Siegel lesbar ist — Original muss nicht vor.",
        paragraphId: "p7_1",
      },
      { text: "Ablehnung. Original ist Original." },
      { text: "Annahme nur, wenn Bewohner Z das Original nachreicht." },
      { text: "Annahme nur, wenn Frau Kowalk gegenzeichnet." },
    ],
    onHit:
      "§7 Absatz eins, Carbon-Gleichwertigkeit. Sauber zitiert. Punkt.",
    onMiss:
      "Falsch. §7 Absatz eins — Carbon ist gleichwertig, sofern Lage drei lesbar. Das hätten Sie wissen können.",
  },
  {
    id: "leitstelle",
    tier: "training",
    opponent: "BRUST",
    opening:
      "Vorgang trägt Aktenzeichen 4711. Tresenwart ruft sicherheitshalber bei Frau Bauerfeind an, ob freigegeben. Korrekt oder überzogen?",
    counters: [
      {
        text:
          "Überzogen. Rückruf ist nur bei Bringschuld der Leitstelle vorgesehen — bei Vorgängen mit Aktenzeichen gilt die Sache als freigegeben.",
        paragraphId: "p6_4",
      },
      { text: "Korrekt. Im Zweifel immer rückrufen." },
      { text: "Überzogen, aber Frau Bauerfeind ist sympathisch." },
      { text: "Korrekt nur außerhalb der Schicht-A-Zeiten." },
    ],
    onHit:
      "§6 Absatz vier, Bringschuld. Aktenzeichen ersetzt den Rückruf. Punkt für Sie.",
    onMiss:
      "Falsch. §6 Absatz vier — Aktenzeichen ersetzt den Rückruf. Sie blamieren sich allmählich.",
    asideOnHit:
      "§6 Absatz vier. Den lese ich seit Jahren am Tresen. Schön zu hören.",
  },
];

/* ───── Endgame-Runden gegen Vossbeck ───────────────────────── */

export const ENDGAME_ROUNDS: ReadonlyArray<DuelRound> = [
  {
    id: "vAuthSchicht",
    tier: "endgame",
    opponent: "VOSSBECK",
    opening:
      "Beginnen wir. Vollmacht 4317 ist von Schicht A gegengezeichnet. Heute haben wir Schicht B. Ich kann das nicht freigeben — Aushang vier Punkt zwei vom 14. März 1996. Eindeutig.",
    counters: [
      {
        text:
          "Eindeutigkeit ist eine Stilfrage, Herr Oberinspektor. Aushang vier Punkt zwei übersagt sieben Punkt eins, aber widerruft ihn nicht — und Schichtübergangsklausel greift, weil die Vollmacht heute morgen einging.",
        requiresParagraphs: ["p3_4", "p8_2"],
      },
      {
        text:
          "Schichtübergangsklausel: Vollmacht gilt heute weiter — am selben Werktag eingereicht.",
        paragraphId: "p3_4",
      },
      { text: "Ich komme morgen in Schicht A wieder." },
      { text: "Frau Kowalk war Schicht A — sie soll gegenzeichnen." },
    ],
    onHit:
      "Sie kennen §3 Absatz vier. Anerkannt. Aber wir haben weitere Vorbehalte.",
    onCounterHit:
      "Sie spielen zwei Paragraphen gegeneinander aus, Bewohner Worag. (Pause.) Das ist … technisch zulässig.",
    onMiss:
      "Bewohner Worag, das genügt nicht. Wir bewegen uns hier auf der Höhe der Verordnung.",
  },
  {
    id: "vAuthMarteau",
    tier: "endgame",
    opponent: "VOSSBECK",
    opening:
      "Weiter. B3 ist kein Bewohner-Standardsortiment. Vollmacht 4317 nennt Sie nicht ausdrücklich als Empfänger. Zwei Hindernisse, ein Vorgang.",
    counters: [
      {
        text:
          "Zwei Paragraphen, ein Konter: B3 ist im Bewohnerheft als Kompensationsration geführt — Marteau-Vermerk gilt als Indiz —, und empfängerseitig genügt der Bewohner-Ausweis.",
        requiresParagraphs: ["p3_6", "p2_5"],
      },
      {
        text:
          "Empfängerseitig genügt der Bewohner-Ausweis — Vollmacht lautet auf den Aussteller.",
        paragraphId: "p2_5",
      },
      { text: "Ich hole eine ärztliche Bestätigung nach." },
      { text: "Tragen Sie meine Bewohnernummer in die Vollmacht ein." },
    ],
    onHit:
      "§2 Absatz fünf — Ausweis-Vorrang. Akzeptiert für die Empfängerseite. Aber das Sortiment bleibt offen.",
    onCounterHit:
      "Sie verzahnen §3 Absatz sechs mit §2 Absatz fünf. Beides für sich greift, zusammen lückenlos. Anerkannt.",
    onMiss:
      "Unzureichend. Sie übersehen jeweils die andere Hälfte des Problems.",
  },
  {
    id: "vSiegel",
    tier: "endgame",
    opponent: "VOSSBECK",
    opening:
      "Das Siegel auf Ihrer Vollmacht ist ehrlich gesagt erbärmlich. Der untere Bogen des B in BEWOHNERVERTRETUNG ist abgegriffen, kaum lesbar. Das wäre für sich genommen schon ein Zurückweisungsgrund.",
    counters: [
      {
        text:
          "Mit Verlaub: das Siegel ersetzt die Handzettel-Eintragung — und Mattheit allein begründet keine Zurückweisung. Verlangt ist ein vollständig fehlender Bogen.",
        requiresParagraphs: ["p1_3", "p1_5"],
      },
      {
        text:
          "Mattheit allein ist kein Zurückweisungsgrund — vollständig fehlender Bogen ist verlangt.",
        paragraphId: "p1_5",
      },
      { text: "Ich lasse das Siegel nachstempeln." },
      { text: "Sehen Sie genauer hin — der Bogen ist da." },
    ],
    onHit:
      "§1 Absatz fünf. Korrekt. Eine Zurückweisung wäre tatsächlich nicht haltbar.",
    onCounterHit:
      "§1 Absatz drei UND fünf. Sie schließen die Lücke schon, bevor ich sie öffnen kann.",
    onMiss:
      "Schwach, Bewohner Worag. Ein vollständig fehlender Bogen ist nicht verlangt — wir prüfen Lesbarkeit.",
  },
  {
    id: "vCarbon",
    tier: "endgame",
    opponent: "VOSSBECK",
    opening:
      "Sie legen mir auch nicht das Original vor, sondern einen Carbon-Durchschlag. Bei einem Vorgang dieser Größe würde ich gerne das Original sehen.",
    counters: [
      {
        text:
          "Carbon-Gleichwertigkeit. Sie würden das Original gern sehen — ich verweise auf §7 Absatz eins. Lage drei ist lesbar, Trockensiegel klar erkennbar. Original ist verzichtbar.",
        paragraphId: "p7_1",
      },
      { text: "Ich hole das Original aus meiner Wohnung." },
      { text: "Original und Durchschlag sind doch dasselbe." },
      { text: "Frau Kowalk hat das Original im Schrank." },
    ],
    onHit:
      "§7 Absatz eins. Anerkannt. Lage drei ist lesbar — ich habe es geprüft.",
    onMiss:
      "Bewohner Worag, ohne Original wäre dieser Vorgang nicht zu führen, wenn nicht §7 existierte. Den Sie offenkundig nicht zitieren.",
  },
  {
    id: "vSperrzeitLeitstelle",
    tier: "endgame",
    opponent: "VOSSBECK",
    opening:
      "Letzter Punkt. Wir nähern uns 14 Uhr — Sperrzeit. Außerdem trägt Ihre Vollmacht ein Aktenzeichen, ich würde sicherheitshalber bei der Leitstelle anrufen, ob die Freigabe noch gilt.",
    counters: [
      {
        text:
          "Beides nicht haltbar: Sperrzeit greift nicht, weil mein Vorgang lange vor 14 Uhr angelegt wurde. Und der Rückruf wäre überzogen, weil das Aktenzeichen die Freigabe ersetzt.",
        requiresParagraphs: ["p5_2", "p6_4"],
      },
      {
        text:
          "Sperrzeit greift nicht — mein Vorgang läuft bereits, Identität wurde gegengezeichnet.",
        paragraphId: "p5_2",
      },
      {
        text:
          "Bei Aktenzeichen ist ein Rückruf überzogen — die Bringschuld liegt nicht bei der Leitstelle.",
        paragraphId: "p6_4",
      },
      { text: "Bitte rufen Sie an. Ich warte." },
    ],
    onHit:
      "Anerkannt. Aber das war nur eine Hälfte — die andere bleibt mir.",
    onCounterHit:
      "Sie räumen beide Hindernisse mit einem Satz ab. (Pause.) Bewohner Worag — ich glaube, wir sind durch.",
    onMiss:
      "Sie greifen nur eine Seite an. Die andere bleibt stehen, und damit auch meine Ablehnung.",
  },
];

/* ─────────────────────────────────────────────────────────────
 * UI-Texte und narrative Sequenzen.
 * ───────────────────────────────────────────────────────────── */

export const DUEL_UI_TEXT = {
  /** Titel-Zeile je nach Modus. */
  trainingTitle: "Bürokratie-Duell · Trainingsfall",
  endgameTitle: "Bürokratie-Duell · Vollmacht 4317",
  trainingSubtitle:
    "Brust trägt einen fiktiven Fall vor. Drei korrekte Erwiderungen IN FOLGE — und Sie dürfen den Bürokratiemeister herausfordern. Eine falsche Antwort, und der Sieg-Zähler beginnt von vorn. Doch was Sie lernen, bleibt.",
  endgameSubtitle:
    "Oberinspektor Vossbeck. Fünf Argumentationsrunden. Drei Treffer, und Brust gibt die B3-Ration aus. Drei Fehler, und Sie verlassen den Tresen.",
  prompt: "Ihre Erwiderung:",
  hitsLabel: "Treffer",
  missesLabel: "Fehler",
  roundLabel: "Runde",
  streakLabel: "Brust-Siege in Folge",
  abortLabel: "[ Zurücktreten ]",
  /** Badge auf Antwort-Buttons, wenn ein Paragraph gelernt UND zitiert ist. */
  paragraphBadge: "Paragraph gelernt",
  /** Badge für Widerspruchs-Antwort (mehrere Paragraphen). */
  contradictionBadge: "Paragraphen-Widerspruch",
  /** Hinweis nach gelerntem Paragraphen. */
  learnedLeadIn: "Im Notizbuch ergänzt:",
  /** Brusts/Vossbecks Mimik. */
  brustMood: {
    composed: "Brust steht sehr gerade. Hände auf dem Tresen.",
    sweating: "Brust hat begonnen zu schwitzen. Sein linker Mundwinkel zuckt.",
    crumbling:
      "Brust schaut nicht mehr auf. Er wischt mit dem Handrücken über die Stirn.",
    triumphant:
      "Brust hat sich aufgerichtet. Er hat heute schon einmal gewonnen — er weiß, wie das geht.",
  },
  vossbeckMood: {
    composed:
      "Vossbeck hat die Hände auf dem Rücken. Er hört zu, ohne zu blinzeln.",
    listening:
      "Vossbeck nickt einmal, kurz. Es bedeutet nichts Gutes. Es bedeutet nichts Schlechtes.",
    impressed:
      "Vossbeck schiebt die Brille zurecht. Zum ersten Mal heute hört er wirklich zu.",
    yielding:
      "Vossbeck legt die Vollmacht behutsam auf den Tresen. Er glättet sie nicht. Er muss sie nicht mehr glätten.",
  },
  /** Sieg-Sequenzen je nach Modus. */
  trainingVictoryLines: [
    "Brust legt einen Strich auf seinen Notizblock. »Trainingsdurchgang erfolgreich.«",
    "»Sie sind … ein hartnäckiger Bewohner, Worag. Wenn Sie drei Trainings IN FOLGE gewinnen, fordere ich für Sie den Oberinspektor an.«",
    "Im Hintergrund Kowalk, halblaut: »Du bist näher dran, als Brust es zugibt.«",
  ],
  trainingVictoryHeadline: "Brust gibt diesen Trainingsfall.",
  trainingStreakReadyLines: [
    "Brust legt den Notizblock weg. »Drei Trainingsfälle in Folge. Bewohner Worag — Sie haben sich qualifiziert.«",
    "»Ich rufe Oberinspektor Vossbeck. Bitte halten Sie Ihre Vollmacht 4317 bereit.«",
    "Kowalk schaut nicht hoch. Aber sie hat aufgehört, den Tresen abzuwischen.",
  ],
  trainingStreakReadyHeadline:
    "Drei in Folge. Vossbeck wird angefordert.",
  endgameVictoryLines: [
    "Vossbeck nickt. Einmal. Es ist eine Geste, die Brust noch nie an ihm gesehen hat.",
    "»Bewohner Worag. Ihre Argumentation ist vollständig. Brust — geben Sie aus.«",
    "Brust stellt eine grau-amber lackierte Konservendose auf den Tresen. Etikett: »B3 — KOMPENSATIONSRATION«. Er sieht Layard nicht an.",
    "Vossbeck dreht sich um, geht ohne Gruß zurück ins Inspektorenzimmer.",
    "Kowalk, halblaut: »Den hat hier seit elf Jahren niemand geschlagen, Worag. Niemand.«",
    "[ B3-Ration eingesteckt. ]",
  ],
  endgameVictoryHeadline: "Vossbeck weicht.",
  /** Niederlage-Sequenzen. */
  trainingDefeatLines: [
    "Brust hakt eine Niederlage in seiner Tabelle ab. »Bewohner Worag. Sie scheitern, aber Sie lernen.«",
    "»Versuchen Sie es erneut. Heute, morgen, wann Sie wollen. Der Tresen bleibt geöffnet — solange Sie sachlich bleiben.«",
  ],
  trainingDefeatHeadline: "Trainingsfall verloren.",
  endgameDefeatLines: [
    "Vossbeck dreht sich um. »Bewohner Worag. Ihre Argumentation trägt nicht. Bitte verlassen Sie die Ausgabezone.«",
    "Brust schließt schweigend die Mappe. Er schaut nicht auf.",
    "Kowalk wischt den Tresen ab, an einer Stelle, die schon sauber war.",
  ],
  endgameDefeatHeadline: "Vossbeck weist Sie ab.",
  defeatAccept: "[ Tresen verlassen ]",
  victoryAccept: "[ Annehmen ]",
  abortLines: [
    "Layard tritt einen halben Schritt vom Tresen zurück.",
    "Brust nickt knapp. »Wenn Sie wieder bereit sind, Bewohner Worag.«",
  ],
};

/* ─────────────────────────────────────────────────────────────
 * Auswahl-Logik.
 * ───────────────────────────────────────────────────────────── */

/** Mischt eine Liste, ohne das Original zu mutieren. */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Wählt EINE Trainings-Runde aus, gewichtet so, dass Layard
 * möglichst eine Runde bekommt, deren Lehr-Paragraph er noch
 * nicht kennt — solange das möglich ist. Sonst zufällig aus dem
 * Pool. Antwort-Reihenfolge wird gemischt.
 */
export function pickTrainingRound(
  learned: ReadonlySet<string>,
  recentIds: ReadonlyArray<string> = [],
): DuelRound {
  // Bevorzugt: Runden, deren Lehr-Paragraph noch nicht gelernt ist.
  const recentSet = new Set(recentIds);
  const fresh = TRAINING_ROUNDS.filter(
    (r) => !learned.has(paragraphIdForRound(r)) && !recentSet.has(r.id),
  );
  const fallback = TRAINING_ROUNDS.filter((r) => !recentSet.has(r.id));
  const pool =
    fresh.length > 0
      ? fresh
      : fallback.length > 0
        ? fallback
        : [...TRAINING_ROUNDS];
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked, counters: shuffle(picked.counters) };
}

/** Liefert alle 5 Endgame-Runden in fester Story-Reihenfolge, Antworten gemischt. */
export function pickEndgameRounds(): DuelRound[] {
  return ENDGAME_ROUNDS.map((r) => ({ ...r, counters: shuffle(r.counters) }));
}

/**
 * Welcher Paragraph wird in dieser Runde gelehrt (bei Niederlage)?
 * Nimmt den ersten `paragraphId` aus den Antwort-Optionen, oder den
 * ersten Eintrag der ersten `requiresParagraphs`-Liste. Fallback: leerer
 * String (sollte nie passieren bei wohlgeformtem Pool).
 */
export function paragraphIdForRound(round: DuelRound): string {
  for (const c of round.counters) {
    if (c.paragraphId) return c.paragraphId;
  }
  for (const c of round.counters) {
    if (c.requiresParagraphs && c.requiresParagraphs.length > 0) {
      return c.requiresParagraphs[0];
    }
  }
  return "";
}

/**
 * Klassifiziert eine Antwort gegen den aktuellen Lernstand:
 *  - "hit"          : Single-Paragraph, gelernt → Treffer
 *  - "counterHit"   : Widerspruchs-Konter, alle Paragraphen gelernt → Treffer
 *  - "miss"         : alles andere → Fehler
 */
export function evaluateCounter(
  counter: DuelCounter,
  learned: ReadonlySet<string>,
): "hit" | "counterHit" | "miss" {
  if (
    counter.requiresParagraphs &&
    counter.requiresParagraphs.length > 0 &&
    counter.requiresParagraphs.every((id) => learned.has(id))
  ) {
    return "counterHit";
  }
  if (counter.paragraphId && learned.has(counter.paragraphId)) {
    return "hit";
  }
  return "miss";
}