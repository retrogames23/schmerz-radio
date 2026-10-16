import type { DialogLine, DialogTree, StoryFlag } from "../types";

/**
 * Akt II — der Morgen nach einer gewöhnlichen Nacht.
 *
 * Bekannte E67-Nachbarn bekommen beim ersten Gespräch in Akt II genau
 * eine beiläufige Morgenzeile, danach läuft ihr gewohnter Dialog weiter.
 * Niemand weiß etwas über den Auftrag; höchstens fällt die Mappe auf.
 */
interface Greeting {
  speaker: DialogLine["speaker"];
  text: string;
  subtext?: string;
  flag: StoryFlag;
  trees: string[];
}

const GREETINGS: Greeting[] = [
  {
    speaker: "PHILIPPE",
    text: "Morgen, Layard. — Mit Mappe? Dienstlich heute? Dann sag ich nichts. Ich hab dich nicht gesehen.",
    subtext: "Er grinst halb. Die Frage meint er nicht ernst, die Mappe schon.",
    flag: "philippeAct2Greeted",
    trees: [
      "philippeSmalltalk",
      "philippeAfter",
      "philippeAfterEarly",
      "philippeAfterBeforeProtocol",
      "philippeInLobby",
      "philippeInCorridor36",
      "philippeInCorridor46",
      "philippeInCorridor56",
    ],
  },
  {
    speaker: "BODO",
    text: "Morgen. Ich war schon unten, Kontrollgang. Tee ist auch schon kalt. — Sie sehen aus, als hätten Sie heute einen Termin.",
    subtext: "Er sagt es ohne Neugier. Hausmeister registrieren Veränderungen, sie bewerten sie nicht.",
    flag: "bodoAct2Greeted",
    trees: ["bodoSmalltalk"],
  },
  {
    speaker: "HELKA",
    text: "Ach, Sie. Am Vormittag. Das ist neu. Die meisten Leute auf diesem Gang kenne ich nur am Geräusch ihrer Tür am Abend.",
    flag: "helkaAct2Greeted",
    trees: ["helkaSmalltalk", "helkaSmalltalk2", "helkaHeidegger", "helkaHeideggerShort"],
  },
  {
    speaker: "ENNIS",
    text: "Morgen, Herr Worag. Gut geschlafen? Ich nie. Aber man fragt ja.",
    flag: "ennisAct2Greeted",
    trees: ["ennisSmalltalk", "ennisAfterFlyer"],
  },
  {
    speaker: "KOWALK",
    text: "Frühstücksausgabe. Brei oder Brei mit Zucker, der Zucker ist alle. — Sie wieder. Mit Aktenmappe, sieh an.",
    flag: "kowalkAct2Greeted",
    trees: ["cafeteriaKowalk"],
  },
  {
    speaker: "BRUST",
    text: "Morgenschicht. Wer um diese Zeit kommt, will entweder Brei oder ein Formular. Sie sehen nach Formular aus.",
    flag: "brustAct2Greeted",
    trees: ["cafeteriaBrust"],
  },
  {
    speaker: "KROLL",
    text: "Morgen. Regelverkauf läuft seit sechs. Falls Sie was brauchen, die Kasse zählt wieder.",
    subtext: "Er sieht übernächtigt aus. Seine Schicht hat in der Nacht angefangen.",
    flag: "krollAct2Greeted",
    trees: ["krollKonbini"],
  },
];

const GREETING_LINE_ID = "__act2Morning";

/** Hängt die Akt-II-Morgenzeile vor die genannten Dialogbäume. */
export function withAct2Greetings(
  dialogs: Record<string, DialogTree>,
): Record<string, DialogTree> {
  const out = { ...dialogs };
  for (const g of GREETINGS) {
    for (const treeId of g.trees) {
      const tree = out[treeId];
      if (!tree) continue;
      const originalEnd = tree.onEnd;
      out[treeId] = {
        ...tree,
        start: GREETING_LINE_ID,
        lines: {
          ...tree.lines,
          [GREETING_LINE_ID]: {
            id: GREETING_LINE_ID,
            speaker: g.speaker,
            text: g.text,
            subtext: g.subtext,
            requires: ["act2Started"],
            hiddenWhen: [g.flag],
            next: tree.start,
          },
        },
        onEnd: (api) => {
          if (api.hasFlag("act2Started")) api.setFlag(g.flag);
          originalEnd?.(api);
        },
      };
    }
  }
  return out;
}
