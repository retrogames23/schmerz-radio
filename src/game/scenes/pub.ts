import pubBg from "@/assets/scene-pub.jpg";
import pubToiletBg from "@/assets/scene-pub-toilet.jpg";
import type { Scene } from "../types";

/**
 * Kneipe „Zum stillen Funk" — Multiplayer-Knotenpunkt.
 * Das eigentliche Bar-Geschehen (Sitze, Chat, Bram) liegt im
 * <PubOverlay/>, das immer aktiv ist, wenn `scene === "pub"`.
 * Die Szene selbst hat nur die Tür zur Toilette und den Ausgang
 * zurück in den Verbindungsgang.
 */
export const pubScenes: Record<string, Scene> = {
  pub: {
    id: "pub",
    background: pubBg,
    title: "Kneipe „Zum stillen Funk“",
    intro:
      "Niedrige Decke, Nikotinglanz auf den Wänden. Fünf Hocker an einer Theke, dahinter Bram. Hinten links: eine Tür mit dem schief gemalten Wort »Pissoir«.",
    hotspots: [
      {
        id: "toToilet",
        x: 4,
        y: 38,
        w: 11,
        h: 50,
        label: "Tür: Toilette",
        kind: "exit",
        exitDir: "left",
        onUse: (api) => api.goTo("pubToilet"),
      },
      {
        id: "leavePub",
        x: 84,
        y: 38,
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
      // die Wand selbst und das Eingabefeld liegen im <ToiletWallOverlay/>.
      {
        id: "leaveToilet",
        x: 0,
        y: 0,
        w: 6,
        h: 100,
        label: "Zurück in die Kneipe",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("pub"),
      },
    ],
  },
};