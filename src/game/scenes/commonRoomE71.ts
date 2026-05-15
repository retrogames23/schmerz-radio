import commonRoomE71Bg from "@/assets/scene-common-room-e71.jpg";
import type { Scene } from "../types";

/**
 * E71 — Gemeinschaftsraum hinter Tür 1530.
 * Drei Home-Computer-Nerds (Detlef, Sigi, Ruven) sind ins Hintergrundbild
 * gemalt — keine Sprites. Sie fachsimpeln über Amiga / Modems / Disketten.
 * Im Gespräch streuen sie Fakten ein, die Layard im späteren Quiz braucht.
 * Erst nach dem Quiz wird der Amiga (Workbench + FastWeb) freigegeben.
 */
export const commonRoomE71Scenes: Record<string, Scene> = {
  commonRoomE71: {
    id: "commonRoomE71",
    background: commonRoomE71Bg,
    title: "Gemeinschaftsraum 1530 — Sektor E71",
    intro:
      "Anders als drüben in E67. Echtes Sofa, eine Pflanze, im Regal Disketten in beschrifteten Ordnern. Auf einem Tisch in der Mitte: ein beigefarbener Computer mit dickem CRT — der Bildschirm leuchtet workbench-blau. Drei Jugendliche zwischen 16 und 22 sitzen drumherum, reden quer durcheinander.",
    hotspots: [
      // — Drei Nerds, ins Bild gemalt. Klickflächen liegen über ihren Figuren.
      {
        id: "nerdDetlef",
        // Vorderster Nerd, links am Tisch (vor dem CRT).
        x: 12,
        y: 38,
        w: 18,
        h: 50,
        label: "Detlef (am Amiga)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdDetlef"),
      },
      {
        id: "nerdSigi",
        // Mittiger Nerd, hinten beim Sofa.
        x: 67.4,
        y: 34.2,
        w: 10.4,
        h: 27.5,
        label: "Sigi (auf dem Sofa)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdSigi"),
      },
      {
        id: "nerdRuven",
        // Rechter Nerd, lehnt am Regal.
        x: 77.6,
        y: 11.5,
        w: 14,
        h: 55,
        label: "Ruven (am Regal)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdRuven"),
      },
      {
        id: "amigaCrt",
        // CRT-Monitor mittig.
        x: 27.9,
        y: 52.9,
        w: 18,
        h: 24,
        label: "Amiga · Workbench",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("e71QuizPassed")) {
            // Solange das Quiz nicht bestanden ist, bleibt Detlef Türsteher.
            const heardAll =
              api.hasFlag("metE71Nerd1") &&
              api.hasFlag("metE71Nerd2") &&
              api.hasFlag("metE71Nerd3");
            if (heardAll) {
              api.startDialog("e71Quiz");
              return;
            }
            api.showText([
              "Detlef schiebt sich vor die Tastatur, ohne ruppig zu werden.",
              "„Hör erst mal zu, was wir hier so reden. Dann frag uns. Dann sehen wir weiter.“",
              "(Mit allen drei Nerds reden, dann nochmal an den Amiga.)",
            ]);
            return;
          }
          api.openAmigaWorkbench();
        },
      },
      {
        id: "diskShelf",
        // Diskettenregal links/oben.
        x: 0,
        y: 8,
        w: 12,
        h: 70,
        label: "Diskettenregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei Reihen 3,5-Zoll-Disketten in beschrifteten Ordnern.",
            "»SPIELE / US-IMPORT«, »WB 1.3 SYSTEM«, »DEMO-SCENE 91-92«.",
            "Eine Diskette steht heraus: »FastWeb · BOOTBAR · NICHT MITNEHMEN«.",
          ]),
      },
      {
        id: "usMagazine",
        // US-Magazin auf dem Sofa-Tisch.
        x: 60.6,
        y: 50.4,
        w: 12,
        h: 12,
        label: "US-Computer-Magazin",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "»COMPUTE!'s Amiga Resource — March 1992«. Englisch, Hochglanz.",
            "Auf dem Cover ein Screenshot, der hier in Mitteleuropa eigentlich",
            "verboten sein müsste. In E71 liegt er offen auf dem Sofatisch.",
          ]),
      },
      {
        id: "back1530",
        x: 91.2,
        y: 8,
        w: 14,
        h: 90,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },
};
