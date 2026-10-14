import konbiniBg from "@/assets/scene-konbini-e67.jpg";
import krollSprite from "@/assets/npc-kroll.png";
import type { Scene } from "../types";

/**
 * Konbini E67 (Typ K-4) — rechts neben dem Aufzug in der Lobby.
 * Waren aus dem Mandatsgebiet, Geräte aus dem Wirtschaftsabkommen 1979.
 */
export const konbiniE67Scenes: Record<string, Scene> = {
  konbiniE67: {
    id: "konbiniE67",
    background: konbiniBg,
    title: "Konbini E67 — Typ K-4",
    intro:
      "Grelles Röhrenlicht, graues Linoleum. Ein Kühlschrank surrt. Hinter dickem Glas sitzt ein Mann im beigen Kittel, über ihm läuft eine Leuchtschrift.",
    decals: [{ id: "konbiniTicker", kind: "ledTicker", x: 66, y: 8, w: 22, h: 8.5 }],
    npcs: [
      {
        id: "krollSprite",
        src: krollSprite,
        x: 66,
        y: 27,
        w: 12,
        h: 28.6,
        alt: "Uwe Kroll hinter der Scheibe",
      },
    ],
    hotspots: [
      {
        id: "konbiniExit",
        x: 37,
        y: 84,
        w: 30,
        h: 16,
        label: "Zurück in die Lobby",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
      {
        id: "konbiniKroll",
        x: 66,
        y: 27,
        w: 12,
        h: 27,
        label: "Uwe Kroll (Versorgungswart)",
        kind: "talk",
        onUse: (api) => api.startDialog("krollKonbini"),
      },
      {
        id: "konbiniTickerSpot",
        x: 66,
        y: 6,
        w: 22,
        h: 12,
        label: "Leuchtschrift-Laufband",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Laufband aus bernsteinfarbenen Leuchtpunkten. Am Rahmen ein Typenschild mit japanischen Zeichen und einem deutschen Aufkleber: „Importzulassung Sektor 79/K“.",
            "Die Meldungen kommen per Leitung von der Versorgungskommission. Wer sie schreibt, weiß niemand. Sie klingen alle, als hätte sie dieselbe Schreibmaschine verfasst.",
          ]),
      },
      {
        id: "konbiniFridge",
        x: 10,
        y: 3,
        w: 15,
        h: 90,
        label: "Kühlregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Glastüren, innen beschlagen. Haltbarmilch im Tetraeder, Molke, Quark in Wachspapier. Alles aus Sektor 31.",
            "Auf den Türen japanische Warnaufkleber, halb mit Tesafilm überklebt. Darunter, mit Kugelschreiber: „Tür zu! — Kroll“.",
            "Das Fach ist verriegelt. Ein kleines rotes Lämpchen meldet: Nachtsperre.",
          ]),
      },
      {
        id: "konbiniShelf",
        x: 26,
        y: 22,
        w: 23,
        h: 54,
        label: "Warenregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Dosen ohne Bild, nur ein blauer Stempel: „Mischgemüse II / 1996“. Eingeschweißtes Graubrot. Schmelzsicherungen, Glühstrümpfe, Kernseife.",
            "Hinter dem Regal ein Gitter, abgeschlossen. Man darf sich die Waren nachts ansehen. Nur nicht nehmen.",
          ]),
      },
      {
        id: "konbiniRegister",
        x: 76,
        y: 43,
        w: 20,
        h: 28,
        label: "Kasse und Münzzählwerk",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein bulliges Gerät aus beigem und braunem Hartplastik, verchromte Tasten. Das Typenschild ist japanisch. Darüber Dymo-Streifen: SUMME, STORNO, FACH 4.",
            "Daneben der Münzzähler: Schächte für jede Münzgröße, ein kleines grünes Zählfenster. Er zeigt 0000. Nachts wird nicht gezählt.",
          ]),
      },
    ],
  },
};
