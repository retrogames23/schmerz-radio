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
  // ── Akt II · Ausgabe des Legitimationsschreibens ──────────────────
  vossbeckAct2Letter: {
    id: "vossbeckAct2Letter",
    start: "l0",
    onEnd: (api) => {
      if (!api.hasFlag("act2LetterPickedUp")) {
        api.setFlag("act2LetterPickedUp");
        api.setFlag("sectorMapUnlocked");
        api.addItem({
          id: "rechercheSchreiben",
          name: "Legitimationsschreiben (28/1194)",
          description:
            "Ein Bogen mit Kopfzeile der Abteilung Informationsbeschaffung, Sektor 28. „Der Inhaber ist befugt, im Rahmen des Rechercheauftrags 28/1194 Anwohner, ärztliches Personal und sonstige sachkundige Personen zu befragen.“ Unten ein Stempel und Vossbecks sehr akkurate Paraphe.",
        });
      }
    },
    lines: {
      l0: {
        id: "l0",
        speaker: "VOSSBECK",
        text: "Worag. 28/1194. — Ja. Liegt hier.",
        subtext: "Er zieht einen Bogen aus einer Schachtel, die er nicht ansehen muss.",
        next: "l1",
      },
      l1: {
        id: "l1",
        speaker: "VOSSBECK",
        text: "Ihre Abteilung schickt jemanden vor Ort. Das habe ich in elf Jahren zweimal gesehen. Beide Male stand am Ende ein Vermerk, den niemand lesen wollte.",
        choices: [
          { text: "Was steht in dem Schreiben genau?", next: "l2" },
          { text: "Ich mache nur, was im Auftrag steht.", next: "l3" },
        ],
      },
      l2: {
        id: "l2",
        speaker: "VOSSBECK",
        text: "Dass Sie fragen dürfen. Nicht, dass jemand antworten muss. Der Unterschied ist im Alltag beträchtlich.",
        next: "l4",
      },
      l3: {
        id: "l3",
        speaker: "VOSSBECK",
        text: "Das sagen sie alle am ersten Tag.",
        subtext: "Es klingt beinahe wohlwollend.",
        next: "l4",
      },
      l4: {
        id: "l4",
        speaker: "VOSSBECK",
        text: "Paraphe, Stempel, Datum. — Zeigen Sie es vor, bevor Sie fragen, nicht danach. Und tragen Sie es innen, es regnet.",
        subtext: "Er schiebt den Bogen über den Tisch und greift wieder zum Bleistift.",
        next: "l5",
      },
      l5: {
        id: "l5",
        speaker: "VOSSBECK",
        text: "Und noch eins: Was Sie herausfinden, bringen Sie nicht mir. Alle Hinweise gehen an die Zentralverwaltungsstelle Sektor 28. Nordrand des Angers, langer Bau mit Kolonnade. Schriftform, Paraphe, Abgabe persönlich.",
        subtext: "Er tippt mit dem Bleistift zweimal auf die Tischkante, als markiere er eine Stelle auf einem Plan.",
        next: "l6",
      },
      l6: {
        id: "l6",
        speaker: "LAYARD",
        text: "Ich weiß, wo das ist.",
        subtext: "Er weiß es tatsächlich. Jeder weiß es. Nur war es bisher nie ein Ort, zu dem man ging.",
        end: true,
      },
    },
  },
  // ── friendly: Mira ist auf Layards Seite, Vossbeck weiß es ────────
  vossbeckAct2Friendly: {
    id: "vossbeckAct2Friendly",
    start: "f0",
    lines: {
      f0: {
        id: "f0",
        speaker: "VOSSBECK",
        text: "Worag. Wieder hier. — Ich habe gehört, auf 104,6 sendet jetzt jemand mit Verstärker.",
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