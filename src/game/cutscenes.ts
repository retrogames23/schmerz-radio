/**
 * Zentrale Sammelstelle aller narrativen Klartext-Texte für Cutscenes
 * und das Ending. Hier liegen die Untertitel/Tafel-Texte als reine Daten,
 * damit sie später leicht in eine andere Sprache übersetzt werden können
 * (z. B. `cutscenes.de.ts` / `cutscenes.en.ts`), ohne die UI-Komponenten
 * anfassen zu müssen.
 *
 * IDs / Flags / Item-Schlüssel bleiben sprach-agnostisch und liegen
 * weiterhin in `types.ts` bzw. den Spielmodulen.
 */

// ─── Paramedics-Cutscene ────────────────────────────────────────────

export type ParamedicsSpeaker = "SANITÄTER" | "LAYARD" | "SYSTEM";

export interface ParamedicsLine {
  speaker: ParamedicsSpeaker;
  /** Untertitel-Text (so wird er angezeigt). */
  text: string;
  /** Optionaler abweichender TTS-Text (für Sprach-Synthese-Aussprache). */
  speech?: string;
}

/**
 * Dialog-/System-Zeilen pro Beat. Reihenfolge entspricht den Beats in
 * `ParamedicsCutscene.tsx`. Stille Beats (z. B. die Eröffnung in 2613)
 * stehen hier als leere Liste.
 */
export const PARAMEDICS_LINES: ParamedicsLine[][] = [
  // Beat 0 — stille Vorgeschichte in Philippes Wohnung 2613.
  [],
  // Beat 1 — Sanitäter & Techniker vor 2615.
  [
    {
      speaker: "SANITÄTER",
      text: "Gehen Sie zurück. Wir brechen die Tür auf.",
    },
  ],
  // Beat 2 — Tür birst auf.
  [
    {
      speaker: "SYSTEM",
      text: "Beim dritten Schlag gibt die Tür nach. Sie schwingt auf.",
    },
  ],
  // Beat 3 — Innen: ausgemergelter Mann klopft.
  [
    {
      speaker: "SYSTEM",
      text: "Ein ausgemergelter Mann. Fahle Haut. Schlägt rhythmisch gegen die Wand.",
    },
    {
      speaker: "SYSTEM",
      text: "Layard nimmt seinen Mut zusammen und schaut ihm in die Augen.",
    },
  ],
  // Beat 4 — Close-up der grünen Augen.
  [
    {
      speaker: "SYSTEM",
      text: "Er erwartet tote, glasige Augen. Er findet eine seltsame Klarheit.",
    },
    {
      speaker: "SYSTEM",
      text: "Wie ein Portal in ein mystisches Universum. Layard wird das Bild nicht mehr los.",
    },
  ],
  // Beat 5 — Bergung & Protokoll-Übergabe.
  [
    {
      speaker: "SANITÄTER",
      text: "Kein A-, B- oder C-Problem. Transport mit Trage.",
    },
    {
      speaker: "LAYARD",
      text: "Brauchen Sie mich noch?",
    },
    {
      speaker: "SANITÄTER",
      text: "Ja. Ich drucke Ihnen das Protokoll. Verschlüsselt — für E67.",
    },
    {
      speaker: "SANITÄTER",
      text: "Wir schicken es per Rohrpost. Aber bitte werfen Sie es heute noch ein.",
    },
    {
      speaker: "LAYARD",
      text: "In Ordnung.",
    },
    {
      speaker: "SYSTEM",
      text: "Warum hat er ja gesagt? Er hätte nein sagen können.",
      speech: "Warum hat er, JA, gesagt? Er hätte auch NEIN sagen können.",
    },
  ],
];

/**
 * Beschreibung des Einsatzprotokoll-Items, das Layard am Ende der
 * Sanitäter-Cutscene ausgehändigt bekommt.
 */
export const PARAMEDICS_PROTOCOL_ITEM = {
  name: "Einsatzprotokoll (verschlüsselt)",
  description:
    "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
} as const;

// ─── Ending ────────────────────────────────────────────────────────

/** Ausgeschriebene deutsche Zahlwörter für die kleine Zahlenangabe im Ending. */
const NUM_WORDS = [
  "null",
  "einem",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
  "zehn",
] as const;

function spell(n: number): string {
  return NUM_WORDS[n] ?? String(n);
}

/**
 * Erzeugt die Basis-Tafeln des Endings. `npcCount` ist die Anzahl der
 * Personen, mit denen Layard im Spielverlauf tatsächlich gesprochen hat.
 */
export function buildEndingBaseFrames(npcCount: number): string[][] {
  const peopleLine =
    npcCount === 1
      ? "Er hat heute mit einem Menschen geredet, den er gestern nicht kannte."
      : `Er hat heute mit ${spell(npcCount)} Menschen geredet, die er gestern nicht kannte.`;
  return [
    [
      "Layard legt den Hörer zurück.",
      "Auf dem Tisch: die Datenkapsel. Unverändert. Unzustellbar.",
      "Daneben: das Telefon. Schwarzer Bakelit. Warm vom Hörer.",
    ],
    [
      "In seinem Kopf, langsam: Insas Stimme.",
      "„Bringen Sie es mir vorbei. Persönlich.“",
      "Und davor, leiser: „Das überrascht mich nicht.“",
    ],
    [
      "Layard tritt ans Fenster. Innenhof. Solaranlage. 48 Stunden Notstrom.",
      peopleLine,
      "Über manche von ihnen werden andere reden, sobald er das Zimmer verlässt.",
    ],
    [
      "Auf 104,6 — heute zum ersten Mal — kein Klopfen.",
      "Nur ein Rauschen. Vielleicht trägt es etwas. Vielleicht nicht.",
      "Layard nimmt die Datenkapsel in die Hand.",
      "Sie ist leichter, als sie heute Morgen war.",
    ],
  ];
}

/** Zusatz-Tafeln, falls Layard den Flyer („Wer hält das andere Ende?“) hat. */
export const ENDING_FLYER_FRAMES: string[][] = [
  [
    "Neben der Kapsel liegt ein gefaltetes Blatt.",
    "Ein Mädchen auf einer Etage, deren Nummer er sich nicht gemerkt hat.",
    "„Wer hält das andere Ende?“ — Z.K.S.",
  ],
  [
    "Er zerreißt das Blatt nicht. Er faltet es kleiner.",
    "Es passt jetzt unter die Kapsel.",
  ],
];

/** Statische Texte rund um den Abspann-Bildschirm. */
export const ENDING_UI_TEXT = {
  actLabel: "AKT II — ENDE",
  subtitle: "Schmerz-Radio auf 104,6 — Fortsetzung folgt",
  restart: "▸ Neu beginnen",
  coffee: "☕ Buy me a coffee",
  /** Atmosphäre-Chatter, falls eine Nachricht im Abspann „zerhackt“ sein soll. */
  garbledChatter: "» … «",
} as const;

// ─── Akt-II-Bridge-Cutscene ────────────────────────────────────────
//
// Sauberer Schnitt nach Akt-I-Ending: Layard tritt mit der unzustellbaren
// Datenkapsel den Weg zur Leitstelle an, übergibt sie Insa Bauerfeind
// persönlich (erste nicht-telefonische Begegnung), und bekommt im
// Anschluss von Dr. Okwu eine weiche Resonanz-Pause verordnet.
//
// Bewusst minimalistisch: keine neuen Hintergrund-Assets, nur Untertitel-
// Tafeln im Stil des Endings. Spätere Loops können einzelne Beats mit
// echten Bildern hinterlegen.

export type Act2BridgeBeatStyle =
  /** Schwarzer Bildschirm mit zentriertem Text (wie Ending-Tafeln). */
  | "black"
  /** Schwarzer Bildschirm mit gedämpftem Phosphor-Glow (Insa-Vignette). */
  | "amber"
  /** Schwarzer Bildschirm mit dünner weißer Linie (Okwu-Sprechzimmer). */
  | "clinical";

export interface Act2BridgeBeat {
  /** Optionaler kleiner Header oben (Ort/Zeit), in CRT-Phosphor-Stil. */
  header?: string;
  /** Untertitel-/Erzähl-Zeilen für diesen Beat. */
  lines: string[];
  /** Visuelle Anmutung des Beats. */
  style: Act2BridgeBeatStyle;
}

export const ACT2_BRIDGE_BEATS: Act2BridgeBeat[] = [
  {
    header: "Sektor 28 · Quadrant E67 · 07:14",
    style: "black",
    lines: [
      "Layard wacht ohne Wecker auf.",
      "Auf dem Tisch: die Datenkapsel. Unverändert. Unzustellbar.",
      "Daneben: ein leerer Tee-Becher mit Rand vom Vorabend.",
    ],
  },
  {
    style: "black",
    lines: [
      "Er steckt die Kapsel ein — diesmal in die Innentasche.",
      "Schließt die Wohnungstür hinter sich.",
      "Im Aufzug eine fremde Stille. Niemand fährt mit.",
    ],
  },
  {
    header: "Leitstelle E67 · Eingang",
    style: "amber",
    lines: [
      "Eine Tür, die er sonst nur als Stimme kennt.",
      "Bernsteinfarbenes Glas, ein Schild ohne Bild:",
      "„Leitstelle E67 — bitte klingeln.“",
      "Layard klingelt. Drinnen wird ein Hörer aufgelegt.",
    ],
  },
  {
    header: "Leitstelle E67 · Disposition",
    style: "amber",
    lines: [
      "Insa Bauerfeind, kleiner als am Hörer.",
      "Drei Telefone, zwei davon abgehoben und auf dem Tisch liegend.",
      "Sie sieht ihn an — keine Vermittlungs-Stimme jetzt, nur ein Mensch.",
      "„Worag. — Setzen Sie sich. Ich mach uns einen Tee.“",
    ],
  },
  {
    style: "amber",
    lines: [
      "Layard legt die Kapsel zwischen sie. Sie nickt nicht.",
      "Sie schaut die Kapsel an, als wäre sie ein altes Tier,",
      "von dem alle wussten, dass es eines Tages vor der Tür stehen würde.",
      "„Mikael hat sie zurückgegeben. — Das überrascht mich nicht.“",
    ],
  },
  {
    style: "amber",
    lines: [
      "„Ich nehm sie. Aber nicht für die Akte. Für mich.“",
      "Sie schiebt sie in eine Schublade, die nicht beschriftet ist.",
      "„Da liegen noch ein paar mehr. Manche seit Jahren.“",
      "Der Tee dampft. Niemand greift danach.",
    ],
  },
  {
    style: "amber",
    lines: [
      "„Worag — ich hätte da etwas. Falls Sie ohnehin unterwegs sind.“",
      "Sie sagt es leise. Wie zu jemandem, von dem sie nicht erwartet,",
      "dass er ja sagt. Und doch wartet sie auf die Antwort.",
      "Layard nickt, bevor er weiß, worauf.",
    ],
  },
  {
    header: "E71 · Sprechzimmer 1532 · später",
    style: "clinical",
    lines: [
      "Dr. Okwu hört sich an, was Insa ihr am Telefon angekündigt hat.",
      "Sie nimmt die Brille ab und legt sie sehr ordentlich auf den Tisch.",
      "„Ihre Resonanzwerte von gestern. — Lassen wir's, wie's ist.“",
    ],
  },
  {
    style: "clinical",
    lines: [
      "„Sieben Tage kein Schmerz-Radio. Keine 104,6. Kein Trauer-Band.“",
      "„Ich schreibe Ihnen das nicht auf. Ich bitte Sie nur.“",
      "„Sie können das Gerät jederzeit einschalten. Niemand hält Sie ab.“",
      "„Aber — ich werde es merken. Und Insa wahrscheinlich auch.“",
    ],
  },
  {
    style: "clinical",
    lines: [
      "„In sieben Tagen sind Sie wieder hier. Dann reden wir noch mal.“",
      "Sie schiebt die Brille zurück auf die Nase, lächelt knapp.",
      "„Bis dahin: hören Sie auf das, was ohnehin schon laut genug ist.“",
    ],
  },
  {
    header: "Quadrant E67 · zurück",
    style: "black",
    lines: [
      "Layard kommt nach Hause. Das Schmerz-Radio steht noch da,",
      "wo es gestern stand. Es summt nicht. Es wartet auch nicht.",
      "Es ist nur ein Gerät.",
      "AKT II — beginnt jetzt.",
    ],
  },
] as const;

/** Statische UI-Texte für die Bridge-Cutscene (i18n-vorbereitet). */
export const ACT2_BRIDGE_UI_TEXT = {
  /** Button im Ending, der Akt II startet. */
  continueButton: "▸ Akt II — Weiterspielen",
  /** Skip-Hinweis am unteren Bildschirmrand. */
  skipHint: "Esc / Enter überspringt",
  /** Warnhinweis im Radio-Panel, wenn Layard während der Pause einschaltet. */
  radioPauseWarning: [
    ">> RESONANZ-PAUSE — DR. OKWU",
    "Sieben Tage. Kein 104,6, kein Trauer-Band.",
    "Sie hat es nicht aufgeschrieben. Sie hat darum gebeten.",
    "Wenn Layard jetzt drehen will — niemand hält ihn ab.",
  ],
  radioPauseContinue: "Trotzdem einschalten",
  radioPauseAbort: "Lieber lassen",
} as const;