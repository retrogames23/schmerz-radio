import type { DialogLine, DialogTree, StoryFlag } from "../types";

/**
 * Akt II — der Morgen nach einer gewöhnlichen Nacht.
 *
 * Figuren, die Layard schon aus Akt I (abends) kennt, bekommen beim ersten Gespräch in Akt II genau
 * eine beiläufige Morgenzeile, danach läuft ihr gewohnter Dialog weiter.
 * Niemand weiß etwas über den Auftrag; höchstens fällt die Mappe auf.
 */
interface Greeting {
  speaker: DialogLine["speaker"];
  text: string;
  subtext?: string;
  flag: StoryFlag;
  /** Wird gesetzt, sobald Layard die Figur in Akt I gesprochen hat. */
  known: StoryFlag;
  trees: string[];
  /** Zusätzliche Flags, die gesetzt sein müssen, damit die Zeile erscheint. */
  requires?: StoryFlag[];
  /** Flags, bei denen die Zeile übersprungen wird. */
  hiddenWhen?: StoryFlag[];
}

const GREETINGS: Greeting[] = [
  {
    speaker: "PHILIPPE",
    text: "Morgen, Layard. — Mit Mappe? Dienstlich heute? Dann sag ich nichts. Ich hab dich nicht gesehen.",
    subtext: "Er grinst halb. Die Frage meint er nicht ernst, die Mappe schon.",
    flag: "philippeAct2Greeted",
    known: "philippeKnownAct1",
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
    text: "Morgen. Ich war schon unten, Kontrollgang. Seit vorgestern ohne meine Kanne, der Tee hier schmeckt nach heißer Leitung. — Sie sehen aus, als hätten Sie heute einen Termin.",
    subtext: "Er sagt es ohne Neugier. Hausmeister registrieren Veränderungen, sie bewerten sie nicht.",
    flag: "bodoAct2Greeted",
    known: "bodoKnownAct1",
    // Bodo ließ seine Kanne am Akt-I-Abend in 5610 stehen ("gestern").
    // Am Akt-II-Morgen ist das vorgestern — erst mit der Rückgabe
    // (`gaveBodoThermos`) übernimmt die zweite Variante unten.
    hiddenWhen: ["gaveBodoThermos"],
    trees: ["bodoSmalltalk"],
  },
  {
    speaker: "BODO",
    text: "Morgen. Ich war schon unten, Kontrollgang. Kanne wieder da, Tee wieder warm. — Sie sehen aus, als hätten Sie heute einen Termin.",
    subtext: "Er sagt es ohne Neugier. Hausmeister registrieren Veränderungen, sie bewerten sie nicht.",
    flag: "bodoAct2Greeted",
    known: "bodoKnownAct1",
    requires: ["gaveBodoThermos"],
    trees: ["bodoSmalltalk"],
  },
  {
    speaker: "HELKA",
    text: "Ach, Sie. Am Vormittag. Das ist neu. Die meisten Leute auf diesem Gang kenne ich nur am Geräusch ihrer Tür am Abend.",
    flag: "helkaAct2Greeted",
    known: "helkaKnownAct1",
    trees: ["helkaSmalltalk", "helkaSmalltalk2", "helkaHeidegger", "helkaHeideggerShort"],
  },
  {
    speaker: "ENNIS",
    text: "Morgen, Herr Worag. Gut geschlafen? Ich nie. Aber man fragt ja.",
    flag: "ennisAct2Greeted",
    known: "ennisKnownAct1",
    trees: ["ennisSmalltalk", "ennisAfterFlyer"],
  },
  {
    speaker: "KOWALK",
    text: "Frühstücksausgabe. Brei oder Brei mit Zucker, der Zucker ist alle. — Sie wieder. Mit Aktenmappe, sieh an.",
    flag: "kowalkAct2Greeted",
    known: "kowalkKnownAct1",
    trees: ["cafeteriaKowalk"],
  },
  {
    speaker: "BRUST",
    text: "Morgenschicht. Wer um diese Zeit kommt, will entweder Brei oder ein Formular. Sie sehen nach Formular aus.",
    flag: "brustAct2Greeted",
    known: "brustKnownAct1",
    trees: ["cafeteriaBrust"],
  },
  {
    speaker: "KROLL",
    text: "Morgen. Regelverkauf läuft seit sechs. Falls Sie was brauchen, die Kasse zählt wieder.",
    subtext: "Er sieht übernächtigt aus. Seine Schicht hat gestern Abend angefangen.",
    flag: "krollAct2Greeted",
    known: "krollKnownAct1",
    trees: ["krollKonbini"],
  },
  {
    speaker: "HERBERT",
    text: "Ah! Der Herr von gestern Abend. Vormittags ist die Bibliothek leerer, da hört man die Regale atmen. Wussten Sie, dass Papier nachts Feuchtigkeit aufnimmt?",
    flag: "herbertAct2Greeted",
    known: "herbertKnownAct1",
    trees: ["herbertTalk"],
  },
  {
    speaker: "RECEPTION",
    text: "Guten Morgen. Sie waren gestern Abend schon hier, nicht wahr? Vormittags ist Sprechzeit, es wird voller.",
    flag: "receptionAct2Greeted",
    known: "receptionKnownAct1",
    trees: ["reception"],
  },
  {
    speaker: "OKWU",
    text: "Herr Worag. Vormittagssprechstunde. Ich habe drei Leute vor Ihnen gehabt und zwei nach Ihnen. Setzen Sie sich, wenn Sie wollen.",
    flag: "okwuAct2Greeted",
    known: "okwuKnownAct1",
    trees: ["okwu1", "okwu2", "okwu3", "okwu4"],
  },
  {
    speaker: "MIKAEL",
    text: "Sie schon wieder. Um diese Zeit bin ich wenigstens offiziell im Dienst. Das macht es nicht besser.",
    flag: "mikaelAct2Greeted",
    known: "mikaelKnownAct1",
    trees: ["mikaelReject", "mikaelResonanzAkte"],
  },
  {
    speaker: "DETLEF",
    text: "Morgen. Wir sind nicht über Nacht hiergeblieben, falls Sie das denken. Nur fast.",
    flag: "detlefAct2Greeted",
    known: "detlefKnownAct1",
    trees: ["e71NerdDetlef"],
  },
  {
    speaker: "SIGI",
    text: "Oh, der Besuch von gestern Abend. Kaffee? Nein, wir haben keinen. Ich wollte nur höflich sein.",
    flag: "sigiAct2Greeted",
    known: "sigiKnownAct1",
    trees: ["e71NerdSigi"],
  },
  {
    speaker: "RUVEN",
    text: "Morgen. Die Kiste hat die Nacht durchgerechnet. Ergebnis: nichts. Aber gründlich.",
    flag: "ruvenAct2Greeted",
    known: "ruvenKnownAct1",
    trees: ["e71NerdRuven"],
  },
  {
    speaker: "MINDEN",
    text: "Guten Morgen. Regelverkauf seit sechs. Sie waren gestern Abend da, ich erinnere mich. Abends kommen wenige.",
    subtext: "Sie sagt es leise, wie alles.",
    flag: "mindenAct2Greeted",
    known: "mindenKnownAct1",
    trees: ["mindenKonbini"],
  },
];

const GREETING_LINE_PREFIX = "__act2Morning";

/** Hängt die Akt-II-Morgenzeile vor die genannten Dialogbäume. */
export function withAct2Greetings(
  dialogs: Record<string, DialogTree>,
): Record<string, DialogTree> {
  const out = { ...dialogs };
  for (let gi = 0; gi < GREETINGS.length; gi++) {
    const g = GREETINGS[gi];
    for (const treeId of g.trees) {
      const tree = out[treeId];
      if (!tree) continue;
      const originalEnd = tree.onEnd;
      // Eigene Zeilen-ID je Eintrag und Baum: zwei Varianten derselben
      // Figur (Bodo: Kanne noch nicht zurück / Kanne zurück) hängen so als
      // Kette im selben Baum — die unsichtbare Variante wird per
      // requires/hiddenWhen übersprungen.
      const lineId = `${GREETING_LINE_PREFIX}_${gi}_${treeId}`;
      out[treeId] = {
        ...tree,
        start: lineId,
        lines: {
          ...tree.lines,
          [lineId]: {
            id: lineId,
            speaker: g.speaker,
            text: g.text,
            subtext: g.subtext,
            requires: ["act2Started", g.known, ...(g.requires ?? [])],
            hiddenWhen: [g.flag, ...(g.hiddenWhen ?? [])],
            next: tree.start,
          },
        },
        onEnd: (api) => {
          if (api.hasFlag("act2Started")) api.setFlag(g.flag);
          else api.setFlag(g.known);
          originalEnd?.(api);
        },
      };
    }
  }
  return out;
}
