/**
 * Daten für das „Bürokratie-Duell" (Akt I, Kantine 3602).
 *
 * Adaption des Monkey-Island-Schwertkampfs in Verwaltungs-Floskeln:
 * Brust eröffnet jede Runde mit einer paragraphengestützten Behauptung,
 * Layard wählt aus vier Floskeln die passende Konter-Antwort. Drei
 * Treffer hintereinander → Brust kapituliert → Layard bekommt die B3-Ration
 * direkt aus Brusts Hand (alternativer Lösungsweg, gleichberechtigt zur
 * Trockensiegel-/Quittungs-Fälschung und zum Kowalk-Pfad).
 *
 * Alle Strings hier sind ganze Sätze in einem Daten-Modul — i18n-konform,
 * keine String-Konkatenation, keine JSX-Schnipsel.
 */

export interface DuelCounter {
  /** Antworttext, den Layard wählen kann. */
  text: string;
  /** Trifft diese Antwort die Brust-Behauptung? */
  correct: boolean;
  /**
   * Optionaler Hinweis, wo der Spieler diese Floskel lernen konnte.
   * Aktuell rein dokumentarisch — wird nicht im UI angezeigt.
   */
  source?: "handbook" | "helka" | "brustSmalltalk" | "logic";
}

export interface DuelRound {
  id: string;
  /** Brusts Eröffnung — paragraphengestützte Behauptung. */
  brustOpening: string;
  /** Vier Floskeln, von denen genau eine korrekt entkräftet. */
  counters: DuelCounter[];
  /** Brusts gemurmelte Reaktion bei korrektem Konter. */
  brustOnHit: string;
  /** Brusts triumphierende Reaktion bei Fehlversuch. */
  brustOnMiss: string;
  /** Kowalks halblauter Kommentar im Hintergrund bei Treffer. */
  kowalkAside?: string;
}

/**
 * Pool an Runden. Pro Duell-Versuch werden zufällig drei gezogen
 * (Reihenfolge gemischt). Die korrekte Antwort steht hier immer als
 * erste — der Overlay mischt vor der Anzeige.
 */
export const DUEL_ROUNDS: DuelRound[] = [
  {
    id: "uebersagt",
    brustOpening:
      "Aushang sieben Punkt eins ist von 1991. Aushang vier Punkt zwei ist von 1996. Der jüngere übersagt. Das ist Hausordnung.",
    counters: [
      {
        text: "Übersagt ist nicht widerrufen, Herr Brust. Ohne ausdrücklichen Widerruf gilt der ältere Aushang fort, soweit er nicht im Wortlaut aufgehoben wurde.",
        correct: true,
        source: "brustSmalltalk",
      },
      {
        text: "Dann ist sieben Punkt eins eben Geschichte. Akzeptiert.",
        correct: false,
        source: "logic",
      },
      {
        text: "Ich verlange eine schriftliche Stellungnahme der Leitstelle.",
        correct: false,
        source: "logic",
      },
      {
        text: "Aushänge gelten überhaupt nicht. Das hat mir jemand gesagt.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Das … Punkt sieben Eins ist tatsächlich nie ausdrücklich widerrufen worden. Das ist korrekt.",
    brustOnMiss:
      "Bewohner Worag, Sie verkennen die Lage. Bitte bleiben Sie sachlich.",
    kowalkAside: "Übersagt ist nicht widerrufen. Hat sie schön gesagt.",
  },
  {
    id: "schichtkurz",
    brustOpening:
      "Vollmacht 4317 ist mit Schichtkürzel A gegengezeichnet. Heute Schicht B. Ich kann das nicht bedienen.",
    counters: [
      {
        text: "Bei Schichtwechsel gilt die Vollmacht auf der angrenzenden Schicht weiter, sofern sie an demselben Werktag eingegangen ist. Heute, fünfzehn Uhr zwölf, Schicht B aktiv — Vollmacht heute morgen vorgelegt.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Ich komme morgen wieder. In Schicht A.",
        correct: false,
        source: "logic",
      },
      {
        text: "Ich hole Frau Kowalk. Sie ist Schicht A.",
        correct: false,
        source: "logic",
      },
      {
        text: "Schichtkürzel sind nur Empfehlungen, keine Vorschriften.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Das … das wäre §3 Absatz vier, Schichtübergangsklausel. Stimmt formal.",
    brustOnMiss:
      "So leicht machen wir es uns nicht, Bewohner Worag. Schichtkürzel sind bindend.",
    kowalkAside: "Den Schichtübergang hat er noch nie gehört. Brust.",
  },
  {
    id: "kompensation",
    brustOpening:
      "B3 ist kein Bewohner-Standardsortiment. Ohne ärztliches Indiz keine Ausgabe. So §5 Absatz zwei, Ausgabezone.",
    counters: [
      {
        text: "B3 ist als Kompensationsration im Bewohnerheft erwähnt — §3 Absatz sechs, Beschwerdewege. Vollmacht 4317 trägt den Marteau-Vermerk: das gilt als Indiz nach §5 Absatz zwei lit. b.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Dann hole ich morgen ein ärztliches Indiz.",
        correct: false,
        source: "logic",
      },
      {
        text: "Ich brauche das nicht für mich. Das ist keine Bewohnerausgabe.",
        correct: false,
        source: "logic",
      },
      {
        text: "Wo steht das? Zeigen Sie mir den Aushang.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "§3 Absatz sechs … korrekt zitiert. Marteau-Vermerk gilt tatsächlich als Indiz.",
    brustOnMiss:
      "Wenn Sie das Sortiment nicht kennen, sollten wir hier nicht weiter diskutieren.",
  },
  {
    id: "originalverpackung",
    brustOpening:
      "Charge sechs-zwei-zwei ist seit dem 1. März 1996 nicht mehr im Sortiment. Bestand ist offiziell ausgebucht.",
    counters: [
      {
        text: "Ausgebucht ist nicht entsorgt, Herr Brust. Restposten in Originalverpackung sind nach §4 Absatz neun bis zur Schichtinventur ausgabefähig.",
        correct: true,
        source: "helka",
      },
      {
        text: "Dann hat ja keiner mehr welche. Schade.",
        correct: false,
        source: "logic",
      },
      {
        text: "Vielleicht ist im Lager noch eine.",
        correct: false,
        source: "logic",
      },
      {
        text: "Buchen Sie sie wieder ein.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "§4 Absatz neun … die Restposten-Klausel. Greift bis zur Inventur. Ich räume das ein.",
    brustOnMiss:
      "Bewohner Worag. Wenn die Charge ausgebucht ist, ist sie ausgebucht.",
    kowalkAside: "Restposten-Klausel. Habe ich ihm letzten Monat erklärt. Brust.",
  },
  {
    id: "gegenzeichnung",
    brustOpening:
      "Eine Gegenzeichnung der Schicht A liegt mir hier nicht im Handzettel vor. Ich kann das so nicht freigeben.",
    counters: [
      {
        text: "Die Gegenzeichnung steht auf dem Trockensiegel der Vollmacht selbst — §1 Absatz drei der Schichtübergabeordnung: das Siegel ersetzt die Handzettel-Eintragung.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Dann tragen Sie sie nach. Ich warte.",
        correct: false,
        source: "logic",
      },
      {
        text: "Frau Kowalk wird das mitbekommen haben.",
        correct: false,
        source: "logic",
      },
      {
        text: "Handzettel sind nicht maßgeblich.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Trockensiegel ersetzt … das ist tatsächlich §1 Absatz drei. Sie haben das Heft gelesen.",
    brustOnMiss:
      "Ohne Handzettel-Eintragung läuft nichts an meinem Tresen, Bewohner Worag.",
  },
  {
    id: "ausgabezone",
    brustOpening:
      "Die Ausgabezone ist seit 14:00 für Bewohner-Anliegen geschlossen. Sie haben die Sperrzeit überschritten.",
    counters: [
      {
        text: "Sperrzeiten gelten nicht bei laufenden Vorgängen. Mein Anliegen ist um 13:48 angelegt — Brust, Sie haben die Identität gegengezeichnet, das gilt als Vorgangsbeginn.",
        correct: true,
        source: "helka",
      },
      {
        text: "Entschuldigung. Ich komme morgen wieder.",
        correct: false,
        source: "logic",
      },
      {
        text: "Es ist erst 13:55 — die Uhr geht falsch.",
        correct: false,
        source: "logic",
      },
      {
        text: "Sperrzeiten sind seit 1995 abgeschafft.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Vorgangsbeginn 13:48 … das stimmt. Ich habe die Identität tatsächlich vor 14:00 gegengezeichnet.",
    brustOnMiss:
      "Sperrzeit ist Sperrzeit. Bitte nehmen Sie das in Zukunft ernster.",
  },
  {
    id: "originalprotokoll",
    brustOpening:
      "Carbon-Durchschläge sind keine Ausgabegrundlage. Ohne Original der Vollmacht kann ich nicht freigeben.",
    counters: [
      {
        text: "Der Carbon-Durchschlag der Schicht A gilt nach §7 Absatz eins als ausgabegleichwertig, sofern das Trockensiegel auf der Lage drei lesbar ist. Ist es. Sie können nachprüfen.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Ich hole das Original. Bin in zehn Minuten zurück.",
        correct: false,
        source: "logic",
      },
      {
        text: "Original und Durchschlag sind doch dasselbe.",
        correct: false,
        source: "logic",
      },
      {
        text: "Carbon ist Carbon. Das müssen Sie akzeptieren.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Lage drei … das prüfe ich. (Pause.) Lesbar. §7 Absatz eins greift.",
    brustOnMiss:
      "Ohne Original läuft hier gar nichts, Bewohner Worag.",
  },
  {
    id: "leitstelle",
    brustOpening:
      "Bei Zweifeln rufe ich die Leitstelle an. Frau Bauerfeind wird das klären, im Zweifel zu Ihren Ungunsten.",
    counters: [
      {
        text: "Frau Bauerfeind hat den Vorgang heute morgen telefonisch freigegeben — Aktenzeichen 4317. Ein Rückruf ist nach §6 Absatz vier nur bei Bringschuld der Leitstelle vorgesehen, nicht bei Vorgängen mit Aktenzeichen.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Bitte rufen Sie an. Ich warte.",
        correct: false,
        source: "logic",
      },
      {
        text: "Insa kennt mich. Sie wird das schon richten.",
        correct: false,
        source: "logic",
      },
      {
        text: "Die Leitstelle ist um diese Zeit nicht erreichbar.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Aktenzeichen 4317 … steht hier. §6 Absatz vier — Bringschuld liegt nicht vor. Ein Rückruf wäre überzogen.",
    brustOnMiss:
      "Ich werde anrufen. Sie können hier warten oder nicht warten.",
    kowalkAside:
      "§6 Absatz vier. Den Paragraphen lese ich seit Jahren am Tresen. Schön zu hören.",
  },
  {
    id: "siegel",
    brustOpening:
      "Das Siegel auf der Vollmacht ist matt. Ich erkenne den unteren Bogen des B in »BEWOHNERVERTRETUNG« nicht eindeutig.",
    counters: [
      {
        text: "Mattheit allein begründet keine Zurückweisung. §1 Absatz fünf der Schichtübergabeordnung verlangt einen vollständig fehlenden Bogen — der untere Bogen ist sichtbar, nur abgegriffen.",
        correct: true,
        source: "handbook",
      },
      {
        text: "Dann lassen Sie es nochmal stempeln.",
        correct: false,
        source: "logic",
      },
      {
        text: "Sehen Sie genauer hin. Da ist der Bogen.",
        correct: false,
        source: "logic",
      },
      {
        text: "Mein Augenarzt hat auch nichts erkannt. Trotzdem ausgegeben.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "§1 Absatz fünf … vollständig fehlender Bogen. Ist nicht der Fall. Sie haben recht.",
    brustOnMiss:
      "Ich vermerke das als Mängelbefund. Bitte um Verständnis.",
  },
  {
    id: "bewohnernummer",
    brustOpening:
      "Ihre Bewohnernummer 26-2611 ist auf Vollmacht 4317 nicht ausdrücklich genannt. Ich kann nicht zuordnen.",
    counters: [
      {
        text: "Vollmacht 4317 lautet auf Marteau, nicht auf den Empfänger. Empfängerseitig genügt der Bewohner-Ausweis — §2 Absatz fünf, Ausweis-Vorrang. Ausweis liegt vor.",
        correct: true,
        source: "helka",
      },
      {
        text: "Tragen Sie die Nummer nach. Ich diktiere sie.",
        correct: false,
        source: "logic",
      },
      {
        text: "26-2611, korrekt. Brauchen Sie es schriftlich?",
        correct: false,
        source: "logic",
      },
      {
        text: "Ich bin Marteau. Aushilfsweise.",
        correct: false,
        source: "logic",
      },
    ],
    brustOnHit:
      "Ausweis-Vorrang … §2 Absatz fünf. Korrekt zitiert. Ich kann das so akzeptieren.",
    brustOnMiss:
      "Ohne ausdrückliche Empfängernennung wird das schwierig, Bewohner Worag.",
  },
];

/**
 * UI-Texte und narrative Sequenzen rund um das Duell. Vollständige Sätze,
 * keine Konkatenation. Platzhalter `{name}` werden zur Laufzeit ersetzt.
 */
export const DUEL_UI_TEXT = {
  /** Titelzeile des Overlays. */
  overlayTitle: "Bürokratie-Duell · Tresen Schicht B",
  /** Untertitel mit Erklärung. */
  overlaySubtitle:
    "Drei Treffer in Folge — und Brust gibt nach. Drei Fehlversuche — und der Tresen ist heute geschlossen.",
  /** Anzeige »Treffer / Fehler« im Status. */
  hitsLabel: "Treffer",
  missesLabel: "Fehler",
  roundLabel: "Runde",
  /** Aufforderung an den Spieler in jeder Runde. */
  prompt: "Ihre Erwiderung:",
  /** Beschreibung von Brusts Mimik je nach Fehlversuchsstand. */
  brustMood: {
    composed: "Brust steht sehr gerade. Hände auf dem Tresen.",
    sweating:
      "Brust hat begonnen zu schwitzen. Sein linker Mundwinkel zuckt.",
    crumbling:
      "Brust schaut nicht mehr auf. Er wischt mit dem Handrücken über die Stirn.",
    triumphant:
      "Brust hat sich aufgerichtet. Er hat heute schon einmal gewonnen — er weiß, wie das geht.",
  },
  /** Sieg-Sequenz nach drei Treffern. */
  victoryLines: [
    "Brust legt die Vollmacht sehr sorgfältig auf den Tresen. Glättet sie.",
    "„Bewohner Worag. Ihre Argumentation ist … in sich schlüssig. Ich gebe die Ration aus.“",
    "Er bückt sich, holt eine grau-amber lackierte Dose hervor und schiebt sie über den Tresen.",
    "Im Hintergrund Kowalk, halblaut: „Den habe ich heute zum ersten Mal überzeugt sehen, Worag. Glückwunsch.“",
    "[ B3-Ration eingesteckt. ]",
  ],
  /** Brust gibt auf — Vorrede zur Sieg-Choice. */
  victoryHeadline: "Brust kapituliert.",
  victoryAccept: "[ Ration annehmen ]",
  /** Niederlage-Sequenz nach drei Fehlversuchen. */
  defeatLines: [
    "Brust hebt langsam den Kopf. Seine Mimik wird wieder steif.",
    "„Bewohner Worag. Ich verstehe Ihr Anliegen, aber Ihre Argumentation trägt nicht.“",
    "„Bitte verlassen Sie die Ausgabezone. Sie können es zu einem späteren Zeitpunkt erneut versuchen.“",
    "Kowalk schaut zur Seite. Sie sagt nichts. Heute nicht.",
  ],
  defeatHeadline: "Brust schließt die Ausgabezone.",
  defeatAccept: "[ Tresen verlassen ]",
  /** Button-Text zum Abbrechen mitten im Duell. */
  abortLabel: "[ Zurücktreten ]",
  /** Bestätigung beim Abbrechen mitten im Duell. */
  abortLines: [
    "Layard tritt einen halben Schritt vom Tresen zurück.",
    "Brust nickt knapp. „Wenn Sie wieder bereit sind, Bewohner Worag.“",
  ],
};

/**
 * Wählt zufällig drei verschiedene Runden für ein Duell aus und mischt
 * für jede Runde die Antwortreihenfolge. Die ursprünglichen `correct`-
 * Markierungen bleiben erhalten — nur die Position im Array ändert sich.
 */
export function pickDuelRounds(): DuelRound[] {
  const pool = [...DUEL_ROUNDS];
  // Fisher-Yates für Rundenauswahl.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 3);
  return picked.map((round) => ({
    ...round,
    counters: shuffle(round.counters),
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