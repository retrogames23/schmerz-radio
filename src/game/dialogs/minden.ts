import type { DialogTree } from "../types";

/**
 * Rosa Minden — Versorgungswartin im Konbini E71 (Typ K-4m). Mitte 40,
 * Nachtschicht, ruhig und knapp. Weißer Kittel über dem beigen
 * Mandats-Arbeitskittel. Keine Quest-Fakten, nur Stimmung.
 */
export const mindenDialogs: Record<string, DialogTree> = {
  mindenKonbini: {
    id: "mindenKonbini",
    start: "m1",
    lines: {
      m1: {
        id: "m1",
        speaker: "MINDEN",
        hiddenWhen: ["act2Started"],
        text: "Guten Abend. Leise, bitte — der Flur hört mit. Wenn Sie etwas brauchen: nach neunzehn Uhr nur gegen Schein. S/D für Schichtarbeiter, Notfall-Bezugsschein von der Leitstelle. Paragraph fünf Punkt zwei.",
        next: "hub",
      },
      hub: {
        id: "hub",
        speaker: "MINDEN",
        text: "Sonst noch etwas?",
        choices: [
          { text: "Warum ist hier alles so ... medizinisch?", next: "med1" },
          { text: "Was sagt die Kasse da immer?", next: "j1" },
          { text: "Sie verkaufen Tabletten gegen Schlafstörungen?", next: "t1" },
          { text: "Und wenn jemand zusammenbricht?", next: "n1" },
          { text: "Gute Nacht.", endsDialog: true, hiddenWhen: ["act2Started"] },
          { text: "Einen ruhigen Tag noch.", endsDialog: true, requires: ["act2Started"] },
        ],
      },
      med1: {
        id: "med1",
        speaker: "MINDEN",
        text: "E71 gehört zum Versorgungsverbund der Ambulanzen. Drüben in den Nachbarblöcken sind die Behandlungszimmer, hier wohnen die Leute. Der Konbini führt deshalb Typ K-vier-m — mit Verbandszeug und Notdepot statt Spielwaren. Das Graubrot ist nur Höflichkeit.",
        next: "med2",
      },
      med2: {
        id: "med2",
        speaker: "LAYARD",
        text: "Und Sie? Sind Sie Versorgungswartin oder Krankenschwester?",
        next: "med3",
      },
      med3: {
        id: "med3",
        speaker: "MINDEN",
        text: "Versorgungswartin. Mit Sanitätskurs. Wer um drei Uhr kommt, braucht selten Brot — aber meistens auch keinen Arzt, sondern ein Pflaster und jemanden, der zuhört.",
        next: "hub",
      },
      j1: {
        id: "j1",
        speaker: "MINDEN",
        text: "Japanisch. Die Geräte sind aus dem Abkommen neunundsiebzig. Diese hier sind die Ambulanz-Modelle — die sprechen leiser. Irgendjemand in Tokio hat das so eingestellt, und hier hat es niemand geändert.",
        next: "j2",
      },
      j2: {
        id: "j2",
        speaker: "MINDEN",
        text: "Manchmal sagt sie „Ruhe, bitte“. In einem leeren Laden. Ich habe aufgehört, mich darüber zu wundern.",
        next: "hub",
      },
      t1: {
        id: "t1",
        speaker: "MINDEN",
        text: "Mandats-Sedativ B und Baldriantinktur. Nur gegen Sichtvermerk. Seit den Herbstnebeln gehen davon mehr Packungen weg als Heftpflaster.",
        next: "t2",
      },
      t2: {
        id: "t2",
        speaker: "LAYARD",
        text: "Woran liegt das?",
        next: "t3",
      },
      t3: {
        id: "t3",
        speaker: "MINDEN",
        text: "Schichtdienst, stickige Zimmer, Zugluft. Die Leute liegen wach, lauschen auf das Rohrbrummen und werden nervös. Manche reden sich ein, die Wände würden schwingen. Ich bin nur für die Ausgabe da. Verordnungen schreiben die Ärzte drüben in der Ambulanz.",
        next: "hub",
      },
      n1: {
        id: "n1",
        speaker: "MINDEN",
        text: "Dann ist das ein Notfall, und der Notfall geht vor dem Paragraphen. Aber melden müssen Sie ihn trotzdem — Leitstelle drüben in E67, Etage 3, Aufgang 5, Zimmer 3502. Oder über Telefon, Null-Null-Eins. Der Zettel kommt hinterher. Der Zettel kommt immer hinterher.",
        next: "hub",
      },
    },
  },
};
