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
          { text: "Und wenn nachts jemand zusammenbricht?", next: "n1" },
          { text: "Gute Nacht.", endsDialog: true },
        ],
      },
      med1: {
        id: "med1",
        speaker: "MINDEN",
        text: "Das ist E71. Medizin-Quadrant. Der Konbini führt hier die Ausführung K-vier-m — m wie medizinisch. Verbandsmaterial, Masken, Tees. Das Graubrot ist nur Höflichkeit.",
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
        text: "Beides. Nachts ist das hier dasselbe. Wer um drei Uhr kommt, braucht selten Brot.",
        next: "hub",
      },
      j1: {
        id: "j1",
        speaker: "MINDEN",
        text: "Japanisch. Die Geräte sind aus dem Abkommen neunundsiebzig. Diese hier sind die Krankenhaus-Modelle — die sprechen leiser. Irgendjemand in Tokio hat das so eingestellt, und hier hat es niemand geändert.",
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
        text: "Gegen resonanzbedingte Schlafstörungen. Nur gegen Anweisung. Seit diesem Jahr gehen mehr davon weg als Verbandsmaterial — und wir haben hier einen Quadranten voller Pflaster.",
        next: "t2",
      },
      t2: {
        id: "t2",
        speaker: "LAYARD",
        text: "Seit diesem Jahr?",
        next: "t3",
      },
      t3: {
        id: "t3",
        speaker: "MINDEN",
        text: "Die Leute schlafen schlecht. Sie reden von einem Sender, den sie im Kopf hören. Ich verkaufe nur die Tabletten. Diagnosen stellt Frau Okwu.",
        next: "hub",
      },
      n1: {
        id: "n1",
        speaker: "MINDEN",
        text: "Dann ist das ein Notfall, und der Notfall geht vor dem Paragraphen. Aber melden müssen Sie ihn trotzdem — Leitstelle, Zimmer 4602. Der Zettel kommt hinterher. Der Zettel kommt immer hinterher.",
        next: "hub",
      },
    },
  },
};
