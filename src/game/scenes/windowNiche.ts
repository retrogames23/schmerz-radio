import windowNicheBg from "@/assets/scene-window-niche.jpg";
import type { Scene } from "../types";

export const windowNicheScenes: Record<string, Scene> = {
  windowNiche: {
    id: "windowNiche",
    background: windowNicheBg,
    title: "Fensternische — Ostseite E71",
    intro:
      "Der Gehweg macht einen Knick. Eine Betonwand, ein Fenster, ein Rollo, das fast ganz unten ist. Aus dem Schlitz darunter: eine Hand. Zwischen zwei Fingern eine Zigarette. Auf der Fensterbank ein kleiner Friedhof aus Kippen.",
    hotspots: [
      {
        id: "ralfHand",
        x: 27,
        y: 52,
        w: 22,
        h: 22,
        label: "Hand am Fenster mit Zigarette",
        kind: "talk",
        hiddenWhen: ["metRalf"],
        onUse: (api) => {
          api.setFlag("metRalf");
          api.startDialog("ralfIntro");
        },
      },
      {
        id: "ralfKnown",
        x: 27,
        y: 52,
        w: 22,
        h: 22,
        label: "Ralf",
        kind: "talk",
        requires: ["metRalf"],
        onUse: (api) => {
          // Akt II: einmalige Begrüßung am Morgen danach.
          if (api.hasFlag("act2Started") && !api.hasFlag("ralfAct2Greeted")) {
            api.startDialog("ralfAct2");
            return;
          }
          // Vertrauen braucht Gespräch UND mindestens einen kleinen Gefallen.
          const favor = api.hasFlag("ralfFavorTea") || api.hasFlag("ralfFavorNews");
          if (!api.hasFlag("ralfStage3") && api.hasFlag("ralfAskedNight") && favor) {
            api.setFlag("ralfStage3");
          }
          api.startDialog(
            api.hasFlag("ralfStage3")
              ? "ralfDeep"
              : api.hasFlag("ralfStage2")
                ? "ralfTalk"
                : "ralfIntro",
          );
        },
      },
      {
        id: "shutter",
        x: 21,
        y: 8,
        w: 38,
        h: 42,
        label: "Rollo",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Grau lackiertes Blech, unten ein Schlitz von zwei Handbreit.",
            "Dahinter kein Licht. Nur Rauch, der sich träge herausschiebt.",
            "Wer so wohnt, hat sich entschieden — für die Luft, gegen den Blick.",
          ]),
      },
      {
        id: "cigButts",
        x: 22,
        y: 66,
        w: 40,
        h: 10,
        label: "Zigarettenkippen",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Kippen auf der Fensterbank, ordentlich in Reihen abgelegt.",
            "Nicht weggeworfen. Sortiert.",
            "Jemand hat hier sehr viel Zeit verbracht und sie trotzdem geordnet.",
          ]),
      },
      {
        id: "backToPassage",
        x: 72,
        y: 40,
        w: 27,
        h: 55,
        label: "Zurück zum Verbindungsgang",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("passage"),
      },
    ],
  },
};
