import commonRoomE71Bg from "@/assets/scene-common-room-e71-redesign.jpg";
import commonRoomE71Act2Bg from "@/assets/scene-common-room-e71-redesign-radio.png";
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
    background: (api) => (api.hasFlag("act2Started") ? commonRoomE71Act2Bg : commonRoomE71Bg),
    title: "Gemeinschaftsraum 1530 — Gebäude E71",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Echtes Sofa, eine Pflanze, Disketten in beschrifteten Ordnern. Auf dem Tisch derselbe beigefarbene Computer, daneben drei Becher von gestern Abend. Es riecht nach kaltem Tee."
        : "Anders als drüben in E67. Echtes Sofa, eine Pflanze, im Regal Disketten in beschrifteten Ordnern. Auf einem Tisch in der Mitte: ein beigefarbener Computer mit dickem CRT — der Bildschirm leuchtet workbench-blau. Drei Jugendliche zwischen 16 und 22 sitzen drumherum, reden quer durcheinander.",
    hotspots: [
      // — Drei Nerds, ins Bild gemalt. Klickflächen liegen über ihren Figuren.
      {
        id: "nerdDetlef",
        // Vorderster Nerd, links am Tisch (vor dem CRT).
        x: 18,
        y: 31,
        w: 19,
        h: 64,
        label: "Detlef (am Amiga)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdDetlef"),
      },
      {
        id: "nerdSigi",
        // Mittiger Nerd, hinten beim Sofa.
        x: 33,
        y: 35,
        w: 19,
        h: 26,
        label: "Sigi (auf dem Sofa)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdSigi"),
      },
      {
        id: "nerdRuven",
        // Rechter Nerd, lehnt am Regal.
        x: 59,
        y: 15,
        w: 12,
        h: 61,
        label: "Ruven (am Regal)",
        kind: "talk",
        onUse: (api) => api.startDialog("e71NerdRuven"),
      },
      {
        id: "amigaCrt",
        // Separater CRT links über dem Amiga 1200.
        x: 2.8,
        y: 37,
        w: 15,
        h: 31,
        label: "Amiga · Workbench",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("e71QuizPassed")) {
            // Sobald Layard mit irgendeinem der drei geredet hat, lässt
            // Detlef ihn ans Quiz. Die Quizfakten streuen die Nerds als
            // Chatter im Hintergrund ein — nicht im Pflichtdialog.
            const spokeToAny =
              api.hasFlag("metE71Nerd1") ||
              api.hasFlag("metE71Nerd2") ||
              api.hasFlag("metE71Nerd3");
            if (spokeToAny) {
              api.startDialog("e71Quiz");
              return;
            }
            api.showText([
              "Detlef schiebt sich vor die Tastatur, ohne ruppig zu werden.",
              "„Sag erst mal Hallo. Dann sehen wir weiter.“",
              "(Mit einem der drei reden, dann nochmal an den Amiga.)",
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
        h: 27,
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
        x: 43,
        y: 66,
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
        id: "giveawayBox",
        // Eigenes freies Wandfeld neben dem Eingang, nicht am Sofa.
        x: 78,
        y: 29,
        w: 10.8,
        h: 15,
        label: "„Zu verschenken“-Box",
        kind: "look",
        onUse: (api) => {
          if (!api.hasFlag("act2Started")) {
            api.showText([
              "Eine fest angeschraubte Holzkiste, mit Filzstift beschriftet: »ZU VERSCHENKEN«.",
              "Das Fach ist leer.",
            ]);
            return;
          }
          api.setFlag("sawGiveawayRadio");
          api.showText([
            "Die »ZU VERSCHENKEN«-Kiste. Darin steht heute ein kleines braunes Gerät ohne Typenschild. Ein Drehknopf, eine Skala.",
            "Daran hängt ein handgeschriebener Zettel: »Für schlaflose Nächte. Einfach einschalten.«",
            "Layard kennt die Bauart. Er hat selbst so eines. Er lässt es liegen.",
          ]);
        },
      },
      {
        id: "back1530",
        x: 92,
        y: 4,
        w: 8,
        h: 87,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("corridor15"),
      },
    ],
  },
};
