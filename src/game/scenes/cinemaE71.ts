import cinemaBg from "@/assets/scene-cinema-e71.jpg";
import filmAsset from "@/assets/lehrfilm-mandatsgebiet.mp4.asset.json";
import type { Scene } from "../types";

/**
 * Kinosaal auf Etage 5 des Sektors E71 — „Lichtspielsaal 5“.
 * Die Leinwand ist bewusst leer: Filme werden später ergänzt
 * (siehe CINEMA_FILMS — solange die Liste leer ist, läuft kein Programm).
 */
export const CINEMA_FILMS: { id: string; title: string; url: string }[] = [
  {
    id: "lehrfilm-mandatsgebiet",
    title: "Mandatsgebiet Mitteleuropa — Lehrfilm für Erwachsene",
    url: filmAsset.url,
  },
];

export const cinemaE71Scenes: Record<string, Scene> = {
  cinemaE71: {
    id: "cinemaE71",
    background: cinemaBg,
    title: "Lichtspielsaal 5 — Gebäude E71",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Reihen roter Klappsitze, alle leer. Am Vormittag gibt es keine Vorstellung, nur die Notbeleuchtung brennt. Hinten surrt der Projektor im Leerlauf."
        : "Reihen roter Klappsitze, alle leer. Vorn eine große, gealterte Leinwand. Hinten surrt ein Projektor, ohne etwas zu zeigen. Die Luft riecht nach warmem Staub und altem Zelluloid.",
    hotspots: [
      {
        id: "cinemaScreen",
        x: 30,
        y: 14,
        w: 45,
        h: 33,
        label: "Leinwand",
        kind: "look",
        onUse: (api) => {
          if (CINEMA_FILMS.length === 0) {
            api.showText([
              "Eine große, leicht vergilbte Leinwand. In der Mitte ein heller Fleck,",
              "wo jahrzehntelang dasselbe Testbild stand.",
              "Kein Programm. Nur das Rauschen der Lüftung.",
            ]);
            return;
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("cinema:play"));
          }
        },
      },
      {
        id: "cinemaProjector",
        x: 16,
        y: 48,
        w: 20,
        h: 30,
        label: "Projektor",
        kind: "use",
        onUse: (api) =>
          api.showText([
            "Ein schwerer Apparat aus Stahl und Bakelit. Er läuft — leer.",
            "Auf dem Sockel ein Schild: „NICHT BERÜHREN — GERÄT“.",
            "Im Fach daneben: keine Rolle. Nur Staub und ein leerer Filmkern.",
          ]),
      },
      {
        id: "cinemaSeats",
        x: 60,
        y: 55,
        w: 36,
        h: 38,
        label: "Sitzreihen",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Rote Klappsitze, das Polster an den Kanten durchgesessen.",
            "Auf einer Lehne mit Kugelschreiber: „Vorführung fällt aus.“",
            "Darunter, andere Handschrift: „Seit wann?“",
          ]),
      },
      {
        id: "cinemaPoster",
        x: 4,
        y: 6,
        w: 12,
        h: 30,
        label: "Aushang",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Programmaushang hinter mattem Glas.",
            "„Lichtspielsaal 5 — Vorführungen nach Bedarfsmeldung.",
            "Bedarf ist zu melden. Meldungen werden geprüft.“",
            "Im Feld für den Titel, mit Schreibmaschine:",
            "„Mandatsgebiet Mitteleuropa — Lehrfilm für Erwachsene“.",
          ]),
      },
      {
        id: "cinemaOut",
        x: 6,
        y: 40,
        w: 8,
        h: 40,
        label: "Zurück zum Aufzug",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("elevatorE71"),
      },
    ],
  },
};
