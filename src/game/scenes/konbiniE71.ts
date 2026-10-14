import konbiniE71Bg from "@/assets/scene-konbini-e71.jpg";
import type { Scene } from "../types";

/**
 * Konbini E71 (Typ K-4m) — der medizinische Ableger im Medizin-Quadranten.
 * Eingang über die Tür links neben dem Verzeichnis-Brett in der E71-Lobby.
 * Ware klinisch, Geräte aus dem Wirtschaftsabkommen 1979.
 */
export const konbiniE71Scenes: Record<string, Scene> = {
  konbiniE71: {
    id: "konbiniE71",
    background: konbiniE71Bg,
    title: "Konbini E71 — Typ K-4m",
    intro:
      "Weiße Fliesen, grelle Röhren, ein Geruch nach Desinfektionsseife und Tee. Halb Laden, halb Sanitätsausgabe. Hinter der Kasse steht eine Frau im weißen Kittel, über ihr läuft eine Leuchtschrift.",
    decals: [
      {
        id: "konbiniTickerE71",
        kind: "ledTicker",
        x: 77.5,
        y: 3.4,
        w: 21.5,
        h: 3.6,
        skewY: -8,
        tickerText:
          "+++ KONBINI E71 · TYP K-4m +++ RESONANZ-HYGIENE: MASKENPFLICHT IN WARTEBEREICHEN +++ RUHE IST EIN HYGIENE-MERKMAL +++ NACHTVERKAUF NUR MIT SCHEIN S/D ODER NOTFALL-BESCHEINIGUNG +++ TABLETTEN GEGEN RESONANZBEDINGTE SCHLAFSTÖRUNGEN NUR GEGEN ANWEISUNG +++ 静かにしてください +++ ",
      },
    ],
    hotspots: [
      {
        id: "konbiniE71Exit",
        x: 40,
        y: 86,
        w: 24,
        h: 14,
        label: "Zurück zum Empfang",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("e71Lobby"),
      },
      {
        id: "konbiniMinden",
        x: 81,
        y: 26,
        w: 12,
        h: 32,
        label: "Rosa Minden (Versorgungswartin)",
        kind: "talk",
        onUse: (api) => api.startDialog("mindenKonbini"),
      },
      {
        id: "konbiniTickerSpotE71",
        x: 76,
        y: 0,
        w: 24,
        h: 12,
        label: "Leuchtschrift-Laufband",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Dasselbe bernsteinfarbene Laufband wie in E67, nur leiser gefasst. Die Meldungen kommen hier vom Hygiene-Referat des Quadranten.",
            "Zwischen den Durchsagen blinkt immer wieder dieselbe Zeile: „RUHE IST EIN HYGIENE-MERKMAL.“",
          ]),
      },
      {
        id: "konbiniE71Fridge",
        x: 0,
        y: 12,
        w: 14,
        h: 68,
        label: "Kühlwand",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Glastüren, penibel gefegt. Haltbarmilch, Molke, Infusionslösungen für den Hausgebrauch — alles mit dem blauen Behördenstempel.",
            "Ein Schild in zwei Sprachen: „Nachtsperre ab 19 Uhr“. Darunter, handschriftlich: „Auch für Kollegen. — R. Minden“.",
          ]),
      },
      {
        id: "konbiniE71Shelf",
        x: 22,
        y: 38,
        w: 26,
        h: 52,
        label: "Warenregal",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Verbandskästen, OP-Masken in Zellophan, Kräutertees, Desinfektionsseife. Dazwischen, fast verloren: eine Reihe Graubrot.",
            "Eine Dose trägt die Aufschrift „Tabletten gegen resonanzbedingte Schlafstörungen — nur gegen Anweisung“. Jemand hat „Anweisung“ durchgestrichen und „Rezept“ darübergeschrieben.",
          ]),
      },
      {
        id: "konbiniE71Register",
        x: 66,
        y: 38,
        w: 15,
        h: 26,
        label: "Kasse und Münzzählwerk",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Dasselbe japanische Modell wie in E67: beiges Hartplastik, verchromte Tasten, Dymo-Streifen. Nur dass hier alles aussieht, als würde es täglich desinfiziert.",
            "Der Münzzähler zeigt 0000. Ein Zettel am Gehäuse: „Zählwerk empfindlich. Bitte nicht anlehnen.“",
          ]),
      },
    ],
  },
};
