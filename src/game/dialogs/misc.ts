import type { DialogTree } from "../types";

export const miscDialogs: Record<string, DialogTree> = {
  emptyOfficeSign: {
    id: "emptyOfficeSign",
    start: "eo1",
    lines: {
      eo1: {
        id: "eo1",
        speaker: "SYSTEM",
        text: "[ An der Tür 3601 hängt ein DIN-A5-Zettel. Maschinenschrift, krumm geklebt. ]",
        next: "eo2",
      },
      eo2: {
        id: "eo2",
        speaker: "SYSTEM",
        text: "„HEUTE NICHT BESETZT — Dienstplan-Engpass. Vertretung für E67: Sektor E71, Zimmer 1534.“",
        next: "eo3",
      },
      eo3: {
        id: "eo3",
        speaker: "LAYARD",
        text: "Was soll ich jetzt tun? Ich rufe die Leitstelle wieder an.",
        end: true,
      },
    },
  },
  emptyOfficeBell: {
    id: "emptyOfficeBell",
    start: "eb1",
    lines: {
      eb1: {
        id: "eb1",
        speaker: "SYSTEM",
        text: "[ Layard drückt den Klingelknopf. Ein dünnes, fernes Klingeln hinter der Tür. ]",
        next: "eb2",
      },
      eb2: {
        id: "eb2",
        speaker: "SYSTEM",
        text: "[ Sieben Sekunden Stille. Ein mechanisches Klacken. Dann nichts mehr. ]",
        next: "eb3",
      },
      eb3: {
        id: "eb3",
        speaker: "LAYARD",
        text: "Niemand. Wirklich niemand.",
        subtext: "Eine Mischung aus Erleichterung und Wut. Beides gleichzeitig, beides leise.",
        end: true,
      },
    },
  },
};
