import type { DialogTree } from "../types";

/**
 * Vossbeck in Akt II — drei Personae, je nach Mira-State.
 *
 * Eingestiegen wird über den Hotspot in 3603, sobald `act2Started` gilt
 * (siehe `kantinenverwaltung3603.ts`). Welche Persona spielt, entscheidet
 * dort die `getMiraEndState`-Helferfunktion. Inhalte so gehalten, dass sie
 * auch ohne die noch folgenden Akt-II-Rätsel-Szenen schon Atmosphäre
 * stiften und den Spielwelt-State spürbar machen.
 */
export const vossbeckAct2Dialogs: Record<string, DialogTree> = {
  // ── friendly: Mira ist auf Layards Seite, Vossbeck weiß es ────────
  vossbeckAct2Friendly: {
    id: "vossbeckAct2Friendly",
    start: "f0",
    lines: {
      f0: {
        id: "f0",
        speaker: "VOSSBECK",
        text: "Worag. Wieder hier. — Ich habe gehört, auf 104,0 sendet jetzt jemand mit Verstärker.",
        subtext: "Der Bleistift bleibt senkrecht. Aber er sieht Layard länger an als nötig.",
        next: "f1",
      },
      f1: {
        id: "f1",
        speaker: "VOSSBECK",
        text: "Sie wissen sicher nichts davon. — Ich auch nicht.",
        subtext: "Es klingt nicht nach Drohung. Eher wie ein gemeinsames Geheimnis, das keiner zugeben darf.",
        end: true,
      },
    },
  },
  // ── neutral: rein pragmatisch, kein Affekt ────────────────────────
  vossbeckAct2Neutral: {
    id: "vossbeckAct2Neutral",
    start: "n0",
    lines: {
      n0: {
        id: "n0",
        speaker: "VOSSBECK",
        text: "Worag. Falls Sie eine Fallnummer haben — ich bin pragmatisch.",
        subtext: "Pragmatisch klingt aus seinem Mund wie eine Drohung.",
        next: "n1",
      },
      n1: {
        id: "n1",
        speaker: "VOSSBECK",
        text: "Falls nicht, gilt: Tür ist da. Ich notiere mir den Besuch nicht.",
        end: true,
      },
    },
  },
  // ── skeptical: Vossbeck wittert einen Verbündeten ─────────────────
  vossbeckAct2Skeptical: {
    id: "vossbeckAct2Skeptical",
    start: "s0",
    lines: {
      s0: {
        id: "s0",
        speaker: "VOSSBECK",
        text: "Worag. Setzen Sie sich.",
        subtext: "Erstmals legt er den Bleistift hin.",
        next: "s1",
      },
      s1: {
        id: "s1",
        speaker: "VOSSBECK",
        text: "Manche Bewohner halten meine Phrasen für ein Hindernis. Andere für ein Werkzeug.",
        next: "s2",
      },
      s2: {
        id: "s2",
        speaker: "VOSSBECK",
        text: "Sie scheinen mir zur zweiten Sorte zu gehören. — Ich behalte Sie im Auge. Im freundlichen Sinne.",
        end: true,
      },
    },
  },
};