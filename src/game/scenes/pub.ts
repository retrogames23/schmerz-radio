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
      // Direkt im Bild anklickbare Barhocker. Lösen über ein
      // CustomEvent das eigentliche Hinsetzen im PubOverlay aus.
      ...[
        { i: 0, x: 39.5, y: 60.5, w: 5.5, h: 11 },
        { i: 1, x: 47.5, y: 63.5, w: 6, h: 12 },
        { i: 2, x: 51, y: 67.5, w: 6.5, h: 13 },
        { i: 3, x: 54, y: 72, w: 7, h: 14 },
        { i: 4, x: 58, y: 76, w: 8, h: 16 },
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
        x: 33.8,
        y: 36.2,
        w: 11,
        h: 50,
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