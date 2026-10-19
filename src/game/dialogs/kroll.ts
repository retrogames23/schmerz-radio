import type { DialogTree } from "../types";

/**
 * Uwe Kroll — Versorgungswart im Konbini E67 (Typ K-4). 58, Nachtschicht,
 * stoisch, versteht kein Wort der japanischen Gerätebeschriftung.
 */
export const krollDialogs: Record<string, DialogTree> = {
  krollKonbini: {
    id: "krollKonbini",
    start: "k1",
    lines: {
      k1: {
        id: "k1",
        speaker: "KROLL",
        hiddenWhen: ["act2Started"],
        text: "Abend. Wenn Sie was kaufen wollen: nur mit Schein. Nach neunzehn Uhr ruht der Regelverkauf — Schichtarbeiter mit Berechtigungsschein S/D kriegen trotzdem was. Steht im Handbuch, Paragraph fünf Punkt zwei.",
        next: "hub",
      },
      hub: {
        id: "hub",
        speaker: "KROLL",
        text: "Noch was?",
        choices: [
          { text: "Warum sitzen Sie hier, wenn der Laden doch zu ist?", next: "w1", hiddenWhen: ["act2Started"] },
          { text: "Sie sind immer noch da?", next: "w1", requires: ["act2Started"] },
          { text: "Was sagt die Kasse da immer?", next: "j1" },
          { text: "Woher kommen die ganzen Geräte?", next: "g1" },
          { text: "Und wenn es ein Notfall ist?", next: "n1" },
          { text: "Sie haben ein Funkgerät gefunden?", next: "fs1", requires: ["act2Started"], hiddenWhen: ["askedKrollFundsache"], action: (a) => a.setFlag("askedKrollFundsache") },
          { text: "Schönen Abend noch.", endsDialog: true, hiddenWhen: ["act2Started"] },
          { text: "Schönen Tag noch.", endsDialog: true, requires: ["act2Started"] },
        ],
      },
      fs1: {
        id: "fs1",
        speaker: "KROLL",
        text: "Lag im Postfachraum, auf den Briefkästen. Mit Zettel, so ein Geschenk-Ding: ‚Für schlaflose Nächte.‘ Schon das zweite diesen Monat. Holt keiner ab.",
        subtext: "Er sagt es wie über einen Regenschirm. Fundsache ist Fundsache.",
        next: "hub",
      },
      w1: {
        id: "w1",
        speaker: "KROLL",
        text: "Brandschutz. Und Meldekopf für den Flurabschnitt. Ich bin nachts das einzige Licht im Erdgeschoss, das nicht von allein angeht. Um acht löst mich die Kollegin ab — heute ist sie spät.",
        next: "w2",
      },
      w2: {
        id: "w2",
        speaker: "LAYARD",
        text: "Und was machen Sie so eine ganze Nacht?",
        next: "w3",
      },
      w3: {
        id: "w3",
        speaker: "KROLL",
        text: "Bestand zählen. Linoleum wischen. Kreuzworträtsel. Achtzehn Jahre, und das Wort mit vier Buchstaben für ‚Ruhezeit‘ ist immer noch ‚Nacht‘.",
        next: "hub",
      },
      j1: {
        id: "j1",
        speaker: "KROLL",
        text: "Keine Ahnung. Japanisch. Begrüßt Leute, bedankt sich, mahnt die Kühlschranktür. Ich hab die Tasten mit Dymo-Streifen beklebt: SUMME, STORNO, FACH VIER.",
        next: "j2",
      },
      j2: {
        id: "j2",
        speaker: "LAYARD",
        text: "Und wenn sie etwas sagt, das Sie nicht verstehen?",
        next: "j3",
      },
      j3: {
        id: "j3",
        speaker: "KROLL",
        text: "Zweimal mit der flachen Hand aufs Gehäuse. Dann ist sie still. Sagt der Techniker, das hilft nicht. Sagt die Kasse, doch.",
        next: "hub",
      },
      g1: {
        id: "g1",
        speaker: "KROLL",
        text: "Wirtschaftsabkommen neunundsiebzig. Wir haben Stahl und Maschinenteile hingeschickt, die haben Kühlregale, Kassen und Münzzähler geschickt. Die Ware drin ist von hier. Mischgemüse, Graubrot, Sicherungen.",
        next: "g2",
      },
      g2: {
        id: "g2",
        speaker: "KROLL",
        text: "Der Münzzähler hat in achtzehn Jahren nicht einmal falsch gezählt. Das kann ich von der Verwaltung nicht sagen. Ist aber kein Vorwurf. Die zählen einfach andere Sachen.",
        next: "hub",
      },
      n1: {
        id: "n1",
        speaker: "KROLL",
        text: "Dann gehen Sie zur Leitstelle, Zimmer 4602, und holen sich einen Dringlichkeits-Bezugsschein. Oder Sie sind Reisender mit Berechtigungsschein S/D. Sonst bleibt das Fach zu.",
        next: "n2",
      },
      n2: {
        id: "n2",
        speaker: "KROLL",
        text: "Nehmen Sie's nicht persönlich. Mir ist egal, was Sie essen. Mir ist nur nicht egal, was auf dem Zettel steht.",
        next: "hub",
      },
    },
  },
};
