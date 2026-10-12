import apt1104Bg from "@/assets/scene-apt-1104.jpg";
import type { Scene } from "../types";

/**
 * Wohnung 1104 — Gebäude E71, Etage 1, Korridor 11.
 * Bewohnerin: Hanne Brodersen, geb. 1948 in Hamburg, 1966–1972 in den USA.
 * Alt-Hippie ohne Esoterik; Fuller, Mumford, Whole Earth Catalog, Beat.
 * Rein atmosphärisch, lange verlassbare Gesprächsbäume.
 */
export const apt1104Scenes: Record<string, Scene> = {
  apt1104: {
    id: "apt1104",
    background: apt1104Bg,
    title: "Wohnung 1104 — Gebäude E71",
    intro:
      "Hell, warm, überraschend aufgeräumt. Bücherwände bis unter die Decke, ein Ledersessel, Plattenregal, ein Kuppelmodell aus Trinkhalmen. Auf dem Schreibtisch summt ein Computer, wie man ihn im Mandatsgebiet kaum sieht. Es riecht nach Sauerteig.",
    hotspots: [
      {
        id: "hanne",
        x: 54,
        y: 12,
        w: 17,
        h: 70,
        label: "Hanne Brodersen",
        kind: "talk",
        onUse: (api) =>
          api.startDialog(api.hasFlag("metHanne") ? "hanneHub" : "hanneIntro"),
      },
      {
        id: "mac1104",
        x: 6,
        y: 40,
        w: 13,
        h: 25,
        label: "Beiger Computer",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Apple Macintosh, Baujahr 1994, ein lächelnder kleiner Computer im Startbildschirm. Daneben eine Maus mit nur einer Taste. Jemand hat sie sorgfältig mit Klebeband repariert.",
            "Auf dem Schirm ein Stapel Karteikarten, die aufeinander verweisen: Mumford → Fuller → Brand → Mumford. Ein Kreis, kein Archiv.",
          ]),
      },
      {
        id: "wec1104",
        x: 0,
        y: 58,
        w: 14,
        h: 17,
        label: "Stapel „Whole Earth Catalog“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Großformatige, zerlesene Hefte. Auf dem Titel die Erde, fotografiert aus dem All. Darunter der Untertitel: „Access to Tools“.",
            "Zwischen den Seiten Zettel in deutscher Handschrift. Auf einem steht nur: „Werkzeug ist, was man selbst reparieren darf.“",
          ]),
      },
      {
        id: "dome1104",
        x: 72,
        y: 37,
        w: 9,
        h: 15,
        label: "Kuppelmodell",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine geodätische Kuppel aus bunten Trinkhalmen und Pfeifenreinigern. Viele Dreiecke, die zusammen mehr tragen als jedes einzeln.",
            "Man drückt oben drauf, und die ganze Kuppel gibt ein wenig nach, ohne nachzugeben.",
          ]),
      },
      {
        id: "records1104",
        x: 37,
        y: 40,
        w: 19,
        h: 22,
        label: "Plattenregal",
        kind: "look",
        onUse: (api) => {
          if (api.hasFlag("hanneSleeveHint") && !api.hasFlag("hanneInventor")) {
            api.startDialog("hanneSleeve");
            return;
          }
          api.showText([
            "Dylan, fast vollständig. Joan Baez, die Grateful Dead, eine Lesung von Allen Ginsberg auf einem Label, das es nicht mehr gibt.",
            "Daneben, ohne Hülle, eine Platte von Hannes Wader. Als Ausgleich, vermutlich.",
          ]),
      },
      {
        id: "bread1104",
        x: 69,
        y: 80,
        w: 21,
        h: 13,
        label: "Brotbrett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein dunkles Vollkornbrot, selbst gebacken, die Kruste fast schwarz. Zwei Scheiben sind schon abgeschnitten, als hätte man Besuch erwartet.",
            "Es ist das deutscheste Ding in dieser Wohnung. Und vermutlich der Grund, warum sie hier ist.",
          ]),
      },
      {
        id: "back1104",
        x: 92,
        y: 2,
        w: 8,
        h: 88,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("corridor11"),
      },
    ],
  },
};
