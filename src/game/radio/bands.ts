// Schmerz-Radio – statische Daten und Konstanten.
// Aus RadioPanel.tsx ausgelagert, damit das große Render-Modul kleiner
// bleibt und die Konstanten nicht pro Render neu evaluiert werden müssen.

export const RADIO_EXT_TEXT = {
  hiddenFreqIntro: [
    ">> WARTUNGS-FUNKGERÄT 5610 — TRÄGER GEFUNDEN",
    "Aus dem alten Lautsprecher klickt es. Eine müde Männerstimme:",
    "„Wenn das hier jemand hört … hier ist Krummbein, Hausmeister-Vorgänger.“",
    "„Ich lege ein Stück Antennen-Draht in das Schubfach unter dem Funk.“",
    "„Wer das Band kippen will, braucht beides: Kristall und Draht.“",
    "Ein Klacken. Im Schubfach: eine kleine Spule Kupferdraht.",
  ],
  duelIntro: [
    ">> SCHMERZ-RADIO — TRAUER-BAND",
    "Mira hat ihre Antenne aus dem Fenster gehängt.",
    "Auf demselben Band, das das Haus seit Jahren als Trauer kennt,",
    "drückt jetzt eine zweite Welle dagegen — Wut, ungeduldig, jung.",
    "Halte die Frequenz stabil bei 104,0. Lass nicht los, bis das Band kippt.",
  ],
  duelHoldLabel: "FREQUENZ HALTEN",
  duelTargetLabel: "Ziel: 104,0 ±0,1 MHz",
  duelProgressLabel: "Wut überlagert Trauer",
  duelSuccess: [
    ">> BAND GEKIPPT — 103,5–104,5 SENDET JETZT WUT",
    "Layard lässt los. Mira lacht kurz auf — dann wird sie still.",
    "„Jetzt hören sie das, was ich meine. Wenigstens für eine Weile.“",
    "Sie nickt zu ihrem Terminal hinüber. „Wenn du was suchen willst — los.“",
  ],
  duelFailure: [
    "Die Wut-Welle verliert die Spur. Trauer wischt sie weg wie Asche.",
    "Mira flucht leise. „Nochmal. Beim nächsten Mal halt sie ruhiger.“",
  ],
} as const;

/** Ziel-Frequenz des Hidden-Frequency-Rätsels. */
export const HIDDEN_TARGET_FREQ = 102.7;
/** Das Trauer-Band — hier passiert das Resonanz-Duell. */
export const DUEL_TARGET_FREQ = 104.0;
export const DUEL_TOLERANCE = 0.1;
/** Wie lange (ms) die Frequenz im Toleranzfenster gehalten werden muss. */
export const DUEL_HOLD_MS = 5000;

export type BandStyle =
  | "panic"
  | "lonely"
  | "grief"
  | "angel"
  | "longing"
  | "noise"
  | "off";

export interface RadioBand {
  from: number;
  to: number;
  label: string;
  art: string;
  style: BandStyle;
  color: string;
}

export const BANDS: RadioBand[] = [
  { from: 100.0, to: 101.9, label: "Angst / Panik", art: "Statisch, zitternd", style: "panic", color: "bg-destructive" },
  { from: 102.0, to: 103.4, label: "Einsamkeit", art: "Dumpf, wogend", style: "lonely", color: "bg-phosphor-dim" },
  { from: 103.5, to: 104.5, label: "Trauer", art: "Fließend, warm", style: "grief", color: "bg-amber-glow/70" },
  { from: 104.6, to: 104.6, label: "Engel-Trauer", art: "Kristallklar, tief", style: "angel", color: "bg-amber-glow" },
  { from: 105.0, to: 106.5, label: "Sehnsucht", art: "Pulsierend", style: "longing", color: "bg-primary" },
  { from: 107.0, to: 108.0, label: "Gestörte Signale", art: "Rauschen", style: "noise", color: "bg-muted-foreground" },
];

export const BURNED_NOISE_BAND: RadioBand = {
  from: 104.6,
  to: 104.6,
  label: "— Rauschen —",
  art: "Träger ausgefallen",
  style: "noise",
  color: "bg-muted-foreground",
};

export function bandFor(freq: number): RadioBand | null {
  return BANDS.find((b) => freq >= b.from && freq <= b.to) ?? null;
}
