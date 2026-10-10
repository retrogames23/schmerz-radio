import corridor11Bg from "@/assets/scene-corridor-11.jpg";
import type { Scene } from "../types";

/**
 * Etage 1, Korridor 11 — Wohnkorridor in Gebäude E71.
 * Nummernschema wie in E67: erste Ziffer = Etage, zweite = Korridor,
 * letzte beiden = Wohnung. Also 1101–1140.
 * Charakter: sauberer, wärmer, wohnlicher als E67 — Teppich, Wandlampen,
 * Holzleisten. Ein Hotelgang, der so tut, als wäre er kein Verwaltungsbau.
 */
export const corridor11Scenes: Record<string, Scene> = {
  corridor11: {
    id: "corridor11",
    background: corridor11Bg,
    title: "Korridor 11 — Etage 1, Gebäude E71",
    intro:
      "Teppich statt Linoleum. Warmes Licht aus Wandlampen, Holzleisten in Hüfthöhe, gerahmte Drucke, die niemand aufgehängt haben will. Am Ende des Gangs ein Fenster mit geschlossener Jalousie und eine Topfpflanze, die jemand tatsächlich gießt. Es riecht nach Teppichreiniger.",
    hotspots: [
      {
        id: "door1101",
        x: 2,
        y: 5,
        w: 14,
        h: 92,
        label: "Tür 1101 — Bewohnerbibliothek",
        kind: "use",
        onUse: (api) => {
          api.showText([
            "Messingschild, poliert: 1101. Darunter eine Tafel in Handschrift: „Bewohnerbibliothek — DI/DO 17–19, SO 10–12. Bitte leise sein.“",
            "Die Tür steht einen Spalt offen. Warmes Licht, Papiergeruch.",
          ]);
          api.goTo("libraryE71");
        },
      },
      {
        id: "door1103",
        x: 30,
        y: 24,
        w: 8,
        h: 45,
        label: "Tür 1103",
        kind: "use",
        onUse: (api) => {
          if (api.hasFlag("metWalter")) {
            api.goTo("apt1103");
            return;
          }
          api.showText(
            [
              "1103. Vor der Tür steht ein Paar Hausschuhe, ordentlich nebeneinander. Am Rahmen ein handgeschriebener Zettel: „Klingel defekt, Klopfen reicht, aber fest.“",
              "Layard klopft fest. Drinnen brummt etwas Tieffrequentes, dann wird es leiser. Die Tür geht auf, dahinter Kabel, Zeigerinstrumente und Kaffeegeruch.",
            ],
            () => api.goTo("apt1103"),
          );
        },
      },
      {
        id: "door1102",
        x: 84,
        y: 5,
        w: 15,
        h: 92,
        label: "Tür 1102",
        kind: "use",
        onUse: (api) => {
          if (api.hasFlag("metSetsuko")) {
            api.goTo("apt1102");
            return;
          }
          api.showText(
            [
              "1102. Am Rahmen klebt ein Zettel der Hausverwaltung: „Reinigung Di + Fr. Teppichpflege wird gestellt.“ Quer darüber, mit rotem Pinsel, lauter Punkte.",
              "Layard klopft. Drinnen fällt etwas Metallisches um, dann geht die Tür ganz auf, ohne Spalt, ohne Prüfblick.",
            ],
            () => api.goTo("apt1102"),
          );
        },
      },
      {
        id: "door1104",
        x: 63,
        y: 24,
        w: 4.9,
        h: 45,
        label: "Tür 1104",
        kind: "exit",
        onUse: (api) => {
          if (api.hasFlag("metHanne")) {
            api.goTo("apt1104");
            return;
          }
          api.showText(
            [
              "1104. Kein Siegelband, kein rotes Statuslicht, kein Aushang.",
              "Nur eine Tür. Das ist hier offenbar möglich. Layard klopft. Von drinnen: „Offen! Es ist immer offen!“",
            ],
            () => api.goTo("apt1104"),
          );
        },
      },
      {
        id: "corridorPrints",
        x: 22,
        y: 26,
        w: 7,
        h: 22,
        label: "Gerahmter Druck",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Landschaftsdruck in Grün und Grau. Unten rechts eine Registriernummer, kleiner als die Signatur.",
            "Derselbe Druck hängt weiter hinten noch einmal. Und gegenüber. Dekoration nach Stückliste.",
          ]),
      },
      {
        id: "corridorWindow",
        x: 45,
        y: 30,
        w: 10,
        h: 18,
        label: "Fenster mit Jalousie",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Die Lamellen sind geschlossen und verstaubt. Durch die Ritzen: graues Licht, ein Stück Dach, Regen.",
            "Neben dem Fenster steht die Topfpflanze. Feuchte Erde. Jemand kümmert sich.",
          ]),
      },
      {
        id: "corridor11Board",
        x: 69.2,
        y: 25.5,
        w: 6.9,
        h: 19.5,
        label: "Gerahmter Druck",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Derselbe Landschaftsdruck wie gegenüber, nur spiegelverkehrt gehängt. Grün, Grau, eine Registriernummer unten rechts.",
            "Im Glas spiegelt sich die Wandlampe. Dahinter, kaum lesbar, ein alter Klebestreifen: „Korridor 11 — Wohnen, Etage 1 · 1101–1140“.",
          ]),
      },
      {
        id: "backElevator11",
        x: 24,
        y: 80,
        w: 52,
        h: 19,
        label: "Zurück zum Aufzug",
        kind: "exit",
        exitDir: "down",
        onUse: (api) => api.goTo("elevatorE71"),
      },
    ],
  },
};
