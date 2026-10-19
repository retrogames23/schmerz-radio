import corridor35Bg from "@/assets/scene-corridor-35.jpg";
import type { Scene } from "../types";

/**
 * Korridor 35 — Etage 3, Aufgang 5. Fortsetzung der Versorgungsachse links
 * von Korridor 36. Hier sitzt die Leitstelle E67 (Tür 3502). Erst ab Akt II
 * betretbar — vorher hat Layard keinen Grund herzukommen.
 */
export const corridor35Scenes: Record<string, Scene> = {
  corridor35: {
    id: "corridor35",
    background: corridor35Bg,
    bgFit: "contain",
    title: "Korridor 35 — Aufgang 5, Etage 3",
    intro:
      "Dieselbe Versorgungsachse, ein Aufgang weiter. Weniger Kantinengeruch, mehr Aktenstaub. Hinter dem Drahtglas von 3502 brennt Licht, irgendwo klingelt ein Telefon.",
    npcs: [],
    hotspots: [
      {
        id: "door3501",
        x: 7,
        y: 28,
        w: 12,
        h: 59,
        label: "Tür 3501 — Archiv",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Tür 3501. Archiv. Abgeschlossen, und zwar so, als wäre das der eigentliche Zweck der Tür.",
          ]),
      },
      {
        id: "door3502Leitstelle",
        x: 37,
        y: 28,
        w: 13,
        h: 59,
        label: "Tür 3502 — Leitstelle E67 · Disposition",
        kind: "exit",
        exitDir: "up",
        onUse: (api) => api.goTo("leitstelleE67"),
      },
      {
        id: "board35",
        x: 53,
        y: 32,
        w: 12.5,
        h: 22,
        label: "Pinnwand",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Dienstpläne der Leitstelle. Fast jede Schicht: Bauerfeind. Wo ein anderer Name steht, ist er mit Bleistift durchgestrichen und durch »Bauerfeind« ersetzt.",
          ]),
      },
      {
        id: "door3503",
        x: 68,
        y: 28,
        w: 13,
        h: 59,
        label: "Tür 3503 — Technik",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Tür 3503. Technik. Dahinter ein gleichmäßiges Summen — Vermittlungsschränke, vermutlich. Ohne Schlüssel bleibt das eine Vermutung.",
          ]),
      },
      {
        id: "back35",
        x: 85,
        y: 15,
        w: 15,
        h: 75,
        label: "Versorgungsachse → Aufgang 6 · Kantine",
        kind: "exit",
        exitDir: "right",
        onUse: (api) => api.goTo("corridor36"),
      },
    ],
  },
};
