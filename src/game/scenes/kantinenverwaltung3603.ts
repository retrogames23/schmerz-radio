import kantinenverwaltungBg from "@/assets/scene-kantinenverwaltung-3603.jpg";
import type { Scene } from "../types";
import { getMiraEndState } from "../miraState";

/**
 * Raum 3603 — Kantinenverwaltung E67. Eigenes Hinterzimmer von
 * Oberinspektor Vossbeck, direkt neben der Kantine 3602 im Korridor 36.
 * Die Tür existiert immer (anders als zuvor: keine Aktentür hinter der
 * Theke), aber Vossbeck reagiert nur, wenn Layard drei Trainingsfälle
 * gegen Brust gewonnen hat (Flag `vossbeckSummoned`). Vorher ist der
 * Raum betretbar — Vossbeck winkt aber jeden ohne Vorlauf wieder hinaus.
 */
export const kantinenverwaltung3603Scenes: Record<string, Scene> = {
  kantinenverwaltung3603: {
    id: "kantinenverwaltung3603",
    background: kantinenverwaltungBg,
    title: "3603 — Kantinenverwaltung E67",
    intro:
      "Ein schmales Hinterzimmer, kaum drei Schritte breit. Eine Lampe, ein Bleistift, ein Mann, der nicht aufschaut. An der rechten Wand bis zur Decke Pappschachteln mit Vorgangsnummern. Es riecht nach altem Papier und Bohnerwachs.",
    hotspots: [
      {
        id: "vossbeckSpot",
        x: 38.9,
        y: 38.5,
        w: 23.3,
        h: 39.2,
        label: "Oberinspektor Vossbeck",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("knowsVossbeckPath")) {
            api.startDialog("vossbeckNoBusiness");
            return;
          }
          if (!api.hasFlag("vossbeckSummoned")) {
            const streak = api.getBrustWinStreak();
            api.startDialog(
              streak >= 2
                ? "vossbeckUnreadyTwo"
                : streak === 1
                  ? "vossbeckUnreadyOne"
                  : "vossbeckUnready",
            );
            return;
          }
          // Akt II: Vossbecks Persona hängt am Mira-State.
          if (api.hasFlag("act2Started") && api.hasFlag("duelEndgameWon")) {
            const state = getMiraEndState(api);
            api.startDialog(
              state === "friendly"
                ? "vossbeckAct2Friendly"
                : state === "skeptical"
                  ? "vossbeckAct2Skeptical"
                  : "vossbeckAct2Neutral",
            );
            return;
          }
          api.startDialog("cafeteriaVossbeck");
        },
      },
      {
        id: "vossbeckDesk",
        x: 24.3,
        y: 71.5,
        w: 50,
        h: 18,
        label: "Schreibtisch",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein Stahlschreibtisch, militärgrau. Auf der rechten Seite ein Stapel",
            "Vorgänge, alle mit der gleichen, sehr akkuraten Handschrift annotiert.",
            "Daneben ein einzelner Bleistift, vorne neu angespitzt, hinten unbenutzt.",
          ]),
      },
      {
        id: "vossbeckShelves",
        x: 73.4,
        y: 4,
        w: 25.6,
        h: 92,
        label: "Aktenregal bis zur Decke",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Pappschachteln, alphabetisch nach Paragraph sortiert. §1 ganz",
            "oben links, §99 unten rechts, mit einem zusätzlichen roten Punkt.",
            "Vossbeck hat den §99 offenbar oft in der Hand.",
          ]),
      },
      {
        id: "vossbeckWindow",
        x: 1,
        y: 0,
        w: 19.7,
        h: 57.9,
        label: "Fenster mit Jalousie",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Die Jalousie steht halb offen, aber dahinter ist nur Schacht.",
            "Kein Tag, keine Nacht. Vossbeck hat sie wohl seit Jahren nicht angefasst.",
          ]),
      },
      {
        id: "vossbeckExit",
        x: 0,
        y: 70,
        w: 22.7,
        h: 30,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor36"),
      },
    ],
  },
};