import pubBg from "@/assets/scene-pub.jpg";
import pubToiletBg from "@/assets/scene-pub-toilet.jpg";
import pubVestibuleBg from "@/assets/scene-pub-vestibule.jpg";
import type { Scene } from "../types";

/**
 * Kneipe „Zum stillen Funk" — Multiplayer-Knotenpunkt.
 * Das eigentliche Bar-Geschehen (Sitze, Chat, Bram) liegt im
 * <PubOverlay/>, das immer aktiv ist, wenn `scene === "pub"`.
 * Die Szene selbst hat nur die Tür zur Toilette und den Ausgang
 * zurück in den Verbindungsgang.
 */
export const pubScenes: Record<string, Scene> = {
  pubVestibule: {
    id: "pubVestibule",
    background: pubVestibuleBg,
    title: "Vorraum „Zum stillen Funk“",
    intro:
      "Ein schmaler Betonkasten. Über der Tür ein Schild, drunter ein Schloss. Rechts in die Wand gebolzt: eine Lautsprecher-Maske aus Bronze, Kupferkabel quellen darunter hervor wie Bart. Etwas öltropft.",
    hotspots: [
      {
        id: "marvSpeak",
        x: 64,
        y: 20.1,
        w: 16.2,
        h: 40.7,
        label: "MARV-9 ansprechen",
        kind: "talk",
        onUse: (api) => {
          api.setFlag("metMarv");
          window.dispatchEvent(
            new CustomEvent("freechat:open", { detail: { npcId: "marv9" } }),
          );
        },
      },
      {
        id: "pubDoor",
        x: 32,
        y: 22,
        w: 22,
        h: 65,
        label: "Tür zur Kneipe",
        kind: "use",
        onUse: (api) => {
          if (api.hasFlag("marvUnlocked")) {
            api.goTo("pub");
          } else {
            api.showText([
              "MARV-9 (aus dem Lautsprecher, müde):",
              "„… nicht jetzt, Layard. Wir kennen uns kaum. Sag etwas. Oder geh.“",
              "Der Magnetriegel bleibt zu.",
            ]);
          }
        },
      },
      {
        id: "leaveVestibule",
        x: 0,
        y: 0,
        w: 8,
        h: 100,
        label: "Zurück nach draußen",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("elevator"),
      },
    ],
  },
  pub: {
    id: "pub",
    background: pubBg,
    title: "Kneipe „Zum stillen Funk“",
    intro:
      "Niedrige Decke, Nikotinglanz auf den Wänden. Fünf Hocker an einer Theke, dahinter Bram. Hinten links: eine Tür mit dem schief gemalten Wort »Pissoir«.",
    hotspots: [
      // Direkt im Bild anklickbare Barhocker. Lösen über ein
      // CustomEvent das eigentliche Hinsetzen im PubOverlay aus.
      ...[
        { i: 0, x: 49.4, y: 58.4, w: 5, h: 5.6 },
        { i: 1, x: 51.7, y: 61.8, w: 4.4, h: 6.1 },
        { i: 2, x: 54.6, y: 65.7, w: 4.1, h: 4.9 },
        { i: 3, x: 58.6, y: 70, w: 4, h: 4.4 },
        { i: 4, x: 61.3, y: 75.3, w: 5.6, h: 6.8 },
      ].map((s) => ({
        id: `stool${s.i + 1}`,
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
        label: `Hocker ${s.i + 1}: setzen`,
        kind: "use" as const,
        onUse: () => {
          window.dispatchEvent(
            new CustomEvent("pub:takeSeat", { detail: { index: s.i } }),
          );
        },
      })),
      {
        id: "toToilet",
        x: 34.6,
        y: 37,
        w: 8.7,
        h: 33.5,
        label: "Tür: Toilette",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("pubToilet"),
      },
      {
        id: "leavePub",
        x: 16.1,
        y: 27.7,
        w: 12,
        h: 50,
        label: "Hinaus in den Gang",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("passage"),
      },
    ],
  },
  pubToilet: {
    id: "pubToilet",
    background: pubToiletBg,
    title: "Toilette — „Zum stillen Funk“",
    intro:
      "Eine Wand voller Schichten: Stift auf Stift, Layard auf Layard. Hier hat jeder seine Spur hinterlassen.",
    hotspots: [
      // Klickfläche für „zurück" liegt unsichtbar am rechten Rand;
      // die Wand, das Eingabefeld und die Klickfläche für den auf die
      // Wand gemalten Kondomautomaten liegen alle im <ToiletWallOverlay/>
      // (das die ganze Szene überdeckt und sonst Hotspots schluckt).
      {
        id: "leaveToilet",
        x: 92,
        y: 15,
        w: 8,
        h: 100,
        label: "Zurück in die Kneipe",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("pub"),
      },
    ],
  },
};