import leitstelleBg from "@/assets/scene-leitstelle-e67.jpg";
import type { Scene } from "../types";

/**
 * Leitstelle E67 — kleines Disposition-Büro hinter Tür 4602 in Korridor 46.
 * Erste persönliche Begegnung mit Insa Bauerfeind. Wird in Akt II betreten,
 * sobald Layard durch die Bridge-Cutscene aufgewacht ist.
 *
 * Die Szene enthält bewusst keinen Schicht-Botengang. Layard verlässt sie
 * mit einer Frage und einem Item: der „Akte 1978 · N. Sertl · Gutachten
 * C. Marteau". Das ist sein eigenes Ziel für Akt II — nicht ein Auftrag
 * von Insa, sondern eine Genehmigung, etwas zu suchen.
 */
export const leitstelleE67Scenes: Record<string, Scene> = {
  leitstelleE67: {
    id: "leitstelleE67",
    background: leitstelleBg,
    title: "Leitstelle E67 — Disposition",
    intro:
      "Hinter der Tür 4602 ein einzelnes Büro. Linoleum, Resopal, drei beige Tischapparate. Auf der Schrankwand hängende Registratur. Aus einer halb offenen Schublade rieseln vergilbte Karteireiter. Auf dem Tee-Tablett eine Kanne, die wirklich Tee enthält. Insa sitzt am Schreibtisch — kleiner als am Hörer.",
    hotspots: [
      {
        id: "insaInPerson",
        x: 32,
        y: 38,
        w: 36,
        h: 50,
        label: "Insa Bauerfeind",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("insaAct2BriefingDone")) {
            api.startDialog("insaAct2InPerson");
          } else {
            api.startDialog("insaAct2InPersonAfter");
          }
        },
      },
      {
        id: "registratur",
        x: 28,
        y: 27,
        w: 34,
        h: 45,
        label: "Schrankwand · Hängeregistratur",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei Schränke voll Hängeregistratur. Farbige Reiter in einem System,",
            "das Layard nicht versteht.",
            "Eine Schublade ist halb offen — vergilbte Akten, manche älter als er.",
            "Hier liegt mehr ungelesene Welt als in der ganzen Sektor-Bibliothek.",
          ]),
      },
      {
        id: "phones",
        x: 22,
        y: 70,
        w: 38,
        h: 18,
        label: "Drei Tischapparate",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Drei beige Bakelit-Apparate. Zwei davon abgehoben und auf dem Tisch",
            "liegend — Insas Trick, die Vermittlung kurz still zu stellen.",
            "Der dritte Apparat ist eingehängt. Insa sagt, er klingelt nie.",
            "Er ist die direkte Leitung in einen Raum, in dem niemand mehr sitzt.",
          ]),
      },
      {
        id: "teeTablett",
        x: 70,
        y: 72,
        w: 18,
        h: 16,
        label: "Tee-Tablett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Eine Emaille-Kanne, daneben ein Wasserkocher mit rotem Schalter.",
            "Es duftet nach echtem Schwarztee — ein Geruch, der in E67 sonst",
            "nirgends vorkommt.",
            "Insa hat einen zweiten Becher bereitgestellt, ohne zu fragen.",
          ]),
      },
      {
        id: "aushangResonanz",
        x: 90,
        y: 12,
        w: 9,
        h: 30,
        label: "Aushang „Resonanz-Hygiene“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Vergilbtes Blatt, mit zwei Reißnägeln befestigt.",
            "„Resonanz-Hygiene · Pausen sind Teil der Behandlung.“",
            "Darunter, kleiner: „Sieben-Tage-Regel · empfohlen ab Stufe 3.“",
            "Jemand hat mit Bleistift dazugeschrieben: „empfohlen, nicht erzwungen.“",
          ]),
      },
      {
        id: "back4602",
        x: 53,
        y: 24,
        w: 14,
        h: 56,
        label: "Zurück in den Korridor",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("corridor46"),
      },
    ],
  },
};
