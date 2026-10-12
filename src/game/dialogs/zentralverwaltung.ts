import type { DialogChoice, DialogLine, DialogTree, GameApi } from "../types";
import { KNOWLEDGE_ENTRIES, askableAt5011, deriveKnowledge } from "../knowledge";

/**
 * Zentralverwaltungsstelle Sektor 28 — Empfang und Zimmer 5011.
 *
 * In 5011 nimmt Frau Sasse auf, was Layard über die Resonanzüberlastung
 * weiß. Zu jedem Wissensstück entscheidet der Spieler: offenlegen oder
 * verschweigen. Beides wird in `disclosures` gemerkt und ist die Grundlage
 * für spätere Entscheidungen (bis hin zu „Zero is Infinity“).
 */

const receptionDialog: DialogTree = {
  id: "zvsReception",
  start: "r1",
  lines: {
    r1: {
      id: "r1",
      speaker: "ZVSEMPFANG",
      text: "Ihr Anliegen?",
      subtext:
        "Vierhundert Mal am Tag derselbe Satz. Dahinter nichts, nicht einmal Ungeduld.",
      choicesFn: (api) => {
        const out: DialogChoice[] = [];
        if (api.hasFlag("zvsSentTo5011")) {
          out.push({ text: "Ich war schon bei 5011.", next: "rBack" });
        }
        out.push(
          { text: "Ich möchte einen Hinweis abgeben.", next: "r2" },
          { text: "Es geht um eine Resonanzüberlastung in E67.", next: "r2b" },
          { text: "Ich sehe mich erst einmal um.", next: "rLeave" },
        );
        return out;
      },
    },
    r2: {
      id: "r2",
      speaker: "ZVSEMPFANG",
      text: "Hinweis. In Schriftform liegt vor?",
      choices: [
        { text: "Nicht in der Form, die Sie meinen.", next: "r3" },
        { text: "Ich habe alles im Kopf.", next: "r3" },
      ],
    },
    r2b: {
      id: "r2b",
      speaker: "ZVSEMPFANG",
      text: "Resonanz. Wohngürtel Südwest.",
      subtext:
        "Er sagt es nicht als Frage. Er hat den Ort schon eingeordnet, bevor Layard das Gebäude genannt hat.",
      next: "r3",
    },
    r3: {
      id: "r3",
      speaker: "ZVSEMPFANG",
      text: "Dann Aufnahme. Zimmer 5011, zweiter Stock, Treppe hinten. Sie klopfen, Sie warten, Sie treten ein.",
      subtext:
        "Er dreht ein Kärtchen um und schiebt es unter der Scheibe durch, ohne aufzusehen.",
      choices: [
        {
          text: "Danke. 5011.",
          next: "r4",
          action: (a: GameApi) => a.setFlag("zvsSentTo5011"),
        },
        {
          text: "Kann ich das nicht hier abgeben?",
          next: "r3b",
          action: (a: GameApi) => a.setFlag("zvsSentTo5011"),
        },
      ],
    },
    r3b: {
      id: "r3b",
      speaker: "ZVSEMPFANG",
      text: "Hier ist Zuweisung. Abgabe ist oben. Sonst hätte ich Ihnen die Nummer nicht genannt.",
      next: "r4",
    },
    r4: {
      id: "r4",
      speaker: "ZVSEMPFANG",
      text: "Der Nächste, bitte.",
      subtext: "Hinter Layard steht niemand.",
      end: true,
    },
    rBack: {
      id: "rBack",
      speaker: "ZVSEMPFANG",
      text: "Dann liegt Ihre Sache bei 5011. Zurück kommt sie nicht zu mir, sie geht weiter. Wohin, steht nicht in meiner Zuständigkeit.",
      end: true,
    },
    rLeave: {
      id: "rLeave",
      speaker: "ZVSEMPFANG",
      text: "Umsehen ist zulässig. Anfassen ist es nicht.",
      end: true,
    },
  },
};

/**
 * Baut aus dem Wissensregister die Frage-/Antwortzeilen für 5011:
 * pro Eintrag eine Frage, zwei Antworten (offenlegen / ausweichen) und
 * jeweils Sasses Reaktion. Danach zurück zum Verteiler `hub`.
 */
function knowledgeLines(): Record<string, DialogLine> {
  const lines: Record<string, DialogLine> = {};
  for (const e of KNOWLEDGE_ENTRIES) {
    if (!e.askedAt5011) continue;
    lines[`q_${e.id}`] = {
      id: `q_${e.id}`,
      speaker: "SASSE",
      text: e.question,
      choices: [
        {
          text: `Offenlegen: ${e.label}`,
          next: `s_${e.id}`,
          action: (a: GameApi) => a.setDisclosure(e.id, "shared"),
        },
        {
          text: "Für mich behalten",
          next: `w_${e.id}`,
          action: (a: GameApi) => a.setDisclosure(e.id, "withheld"),
        },
      ],
    };
    lines[`s_${e.id}`] = {
      id: `s_${e.id}`,
      speaker: "LAYARD",
      text: e.share,
      next: `n_${e.id}`,
    };
    lines[`n_${e.id}`] = {
      id: `n_${e.id}`,
      speaker: "SASSE",
      text: e.noted,
      subtext:
        e.sensitivity === "brisant"
          ? "Ihre Schrift bleibt gleichmäßig. Nur der Punkt am Satzende sitzt fester als die anderen."
          : undefined,
      next: "hub",
    };
    lines[`w_${e.id}`] = {
      id: `w_${e.id}`,
      speaker: "LAYARD",
      text: e.withhold,
      next: `nw_${e.id}`,
    };
    lines[`nw_${e.id}`] = {
      id: `nw_${e.id}`,
      speaker: "SASSE",
      text: "Gut. Dann lasse ich das Feld frei. Frei ist ehrlicher als ungefähr.",
      subtext:
        "Sie sieht ihn eine Spur zu lange an, dann schreibt sie einen Strich.",
      next: "hub",
    };
  }
  return lines;
}

const sasseDialog: DialogTree = {
  id: "sasse5011",
  start: "s1",
  onStart: (api) => deriveKnowledge(api),
  lines: {
    s1: {
      id: "s1",
      speaker: "SASSE",
      text: "Kommen Sie herein, setzen Sie sich. Sasse, Aufnahme. Ich nehme auf, was Sie wissen — nicht, was Sie vermuten. Das ist kein Vorwurf, das ist nur die Spalte.",
      hiddenWhen: ["metSasse"],
      next: "s2",
    },
    s2: {
      id: "s2",
      speaker: "SASSE",
      text: "Sie müssen mir nichts sagen. Was Sie sagen, wird aufgenommen; was Sie nicht sagen, fehlt nicht. Es steht dann eben nichts da.",
      hiddenWhen: ["metSasse"],
      choices: [
        {
          text: "Verstanden. Fangen wir an.",
          next: "hub",
          action: (a: GameApi) => a.setFlag("metSasse"),
        },
        {
          text: "Und was passiert mit dem, was da steht?",
          next: "s3",
          action: (a: GameApi) => a.setFlag("metSasse"),
        },
      ],
    },
    s3: {
      id: "s3",
      speaker: "SASSE",
      text: "Es geht weiter. Ehrlich gesagt weiß ich nicht, wohin — ich habe die Aufnahme, nicht die Bearbeitung. Ich habe mir angewöhnt, das nicht als Mangel zu sehen. Sonst käme ich hier nicht durch den Tag.",
      next: "hub",
    },
    hub: {
      id: "hub",
      speaker: "SASSE",
      text: "Weiter.",
      subtext: "Der Stift steht auf der nächsten Zeile.",
      choicesFn: (api) => {
        const open = askableAt5011(api).filter(
          (e) => api.getDisclosure(e.id) === null,
        );
        if (open.length === 0) {
          return [{ text: "Mehr habe ich nicht.", next: "close1" }];
        }
        const first = open[0];
        return [
          { text: "Weiter", next: `q_${first.id}` },
          { text: "Ich möchte hier abbrechen.", next: "pause" },
        ];
      },
    },
    pause: {
      id: "pause",
      speaker: "SASSE",
      text: "Selbstverständlich. Die Kladde bleibt offen. Wenn Sie wiederkommen, machen wir dort weiter, wo der Strich steht.",
      end: true,
    },
    close1: {
      id: "close1",
      speaker: "SASSE",
      text: "Dann zähle ich zusammen.",
      subtext: "Sie fährt die Zeilen mit dem Stiftende ab, ohne zu zählen.",
      next: "close2",
    },
    close2: {
      id: "close2",
      speaker: "SASSE",
      text: "Sie haben mir mehr gesagt als die meisten, und weniger, als Sie wissen. Das ist die übliche Menge. Ich vermerke die Vorsprache, Sie bekommen eine Bescheinigung mit Paraphe.",
      choicesFn: (api) => {
        const withheld = KNOWLEDGE_ENTRIES.filter(
          (e) => api.getDisclosure(e.id) === "withheld",
        ).length;
        const out: DialogChoice[] = [];
        if (withheld > 0) {
          out.push({ text: "Woran merken Sie das?", next: "close3" });
        }
        out.push({
          text: "Danke, Frau Sasse.",
          next: "close4",
          action: (a: GameApi) => a.setFlag("zvsIntakeDone"),
        });
        return out;
      },
    },
    close3: {
      id: "close3",
      speaker: "SASSE",
      text: "An den Pausen. Wer nichts weiß, antwortet sofort. Wer etwas weglässt, sortiert vorher. Ich schreibe das nicht auf. Es gibt keine Spalte dafür.",
      choices: [
        {
          text: "Danke, Frau Sasse.",
          next: "close4",
          action: (a: GameApi) => a.setFlag("zvsIntakeDone"),
        },
      ],
    },
    close4: {
      id: "close4",
      speaker: "SASSE",
      text: "Kommen Sie wieder, wenn etwas dazukommt. Und, Herr Worag: dazukommen wird etwas.",
      subtext:
        "Sie sagt es freundlich, wie eine Terminvereinbarung. Genau das macht es schlimm.",
      end: true,
    },
    ...knowledgeLines(),
  },
};

export const zentralverwaltungDialogs: Record<string, DialogTree> = {
  zvsReception: receptionDialog,
  sasse5011: sasseDialog,
};
