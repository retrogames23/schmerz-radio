import libraryBg from "@/assets/scene-library-1101.jpg";
import type { Scene } from "../types";
import { getBook } from "../books";
import { LIBRARY_BOOKS } from "../libraryE71Books";

/**
 * Raum 1101 — Bewohnerbibliothek in Gebäude E71, Etage 1.
 * Erste Tür links im Korridor 11. Bibliothekar: Herbert, um die 60.
 */
export const libraryE71Scenes: Record<string, Scene> = {
  libraryE71: {
    id: "libraryE71",
    background: libraryBg,
    title: "Bewohnerbibliothek 1101 — Gebäude E71",
    intro: (api) =>
      api.hasFlag("act2Started")
        ? "Vormittagslicht fällt schräg durch das große Fenster, Staub tanzt darin. Holzregale, ein Teppich, der jedes Geräusch schluckt, ein Tresen wie in einer kleinen Schulbibliothek von 1995. Es ist ruhiger als gestern Abend."
        : "Helles Licht fällt durch das große Fenster. Holzregale, ein Teppich, der jedes Geräusch schluckt, und ein Tresen wie in einer kleinen Schulbibliothek von 1995. Hinter dem Tresen sortiert ein älterer Mann Karteikarten und nickt freundlich. Auf dem Tresen steht ein Computer mit einem dicken Röhrenmonitor, dessen Bildschirm mattgrün schimmert. Es riecht nach Papier, Holz und frischer Farbe — nicht nach Reiniger.",
    hotspots: [
      {
        id: "herbert",
        x: 52,
        y: 28,
        w: 20,
        h: 55,
        label: "Herbert (Bibliothekar)",
        kind: "talk",
        onUse: (api) => api.startDialog("herbertTalk"),
      },
      {
        id: "crtComputer",
        x: 68,
        y: 50,
        w: 18,
        h: 22,
        label: "Computer mit Röhrenmonitor",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein beiger Rechner mit einem klobigen Röhrenmonitor. Der Bildschirm zeigt ein blinkendes Cursor auf grünem Grund.",
            "Herbert tippt nur selten darauf. „Für den Katalog reicht Papier“, pflegt er zu sagen.",
          ]),
      },
      {
        id: "cardCatalogue",
        x: 78,
        y: 34,
        w: 18,
        h: 30,
        label: "Karteikasten",
        kind: "look",
        onUse: (api) =>
          api.showText([
            `Handbeschriftete Karten, alphabetisch. Der Katalog zählt ${LIBRARY_BOOKS.length} Titel.`,
            "Oben auf dem Kasten liegt eine gedruckte Notiz: „Alle Titel ausleihbar. Bitte bei Herbert eintragen lassen.“",
          ]),
      },
      {
        id: "shelvesLeft",
        x: 0,
        y: 5,
        w: 25,
        h: 60,
        label: "Regale",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Leinenrücken, verblasste Prägungen, dazwischen Bände ohne Titel — nur Registriernummern.",
            "Kein Siegelband, kein Sperrvermerk. Nur eine Ordnung, die jemand von Hand hält.",
          ]),
      },
      {
        id: "readingTable",
        x: 18,
        y: 55,
        w: 30,
        h: 30,
        label: "Lesetisch",
        kind: "look",
        onUse: (api) => {
          const readable = LIBRARY_BOOKS.filter((b) => getBook(b.id));
          if (readable.length === 0) {
            api.showText([
              "Zwei Stühle, ein aufgeschlagener Band, ein Stapel Zeitschriften. Jemand hat eine Karte als Lesezeichen liegen lassen.",
            ]);
            return;
          }
          api.startDialog("libraryReadingTable");
        },
      },
      {
        id: "leseordnung",
        x: 44,
        y: 32,
        w: 12,
        h: 18,
        label: "Leseordnung",
        kind: "look",
        onUse: (api) =>
          api.showText([
            ">> LESEORDNUNG",
            ">> 1. Bücher pflegen.",
            ">> 2. Rechtzeitig zurückgeben.",
            ">> 3. Anderen Freude gönnen.",
            "Kein Formblatt. Kein Paragraph. Layard liest es zweimal.",
          ]),
      },
      {
        id: "openingHours",
        x: 28,
        y: 28,
        w: 8,
        h: 14,
        label: "Öffnungszeiten",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "DI 17–19 · DO 17–19 · SO 10–12.",
            "Darunter, kleiner: „Bei Abwesenheit bitte klopfen. Ich bin meistens da.“",
          ]),
      },
      {
        id: "backCorridor11",
        x: 0,
        y: 18,
        w: 12,
        h: 62,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("corridor11"),
      },
    ],
  },
};
