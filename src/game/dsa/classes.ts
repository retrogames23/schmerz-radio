import type { Attrs } from "./dice";

export type DsaClassId =
  | "krieger"
  | "streuner"
  | "magier"
  | "elf"
  | "zwerg"
  | "gaukler"
  | "thorwaler"
  | "druide";

export interface DsaClass {
  id: DsaClassId;
  name: string;
  /** Mindestwerte (>=). */
  min?: Partial<Attrs>;
  /** Höchstwerte (<=). */
  max?: Partial<Attrs>;
  /** Bekommt Astralenergie? */
  magic: boolean;
  /** Kurzbeschreibung im Charakterbogen. */
  blurb: string;
}

export const DSA_CLASSES: ReadonlyArray<DsaClass> = [
  {
    id: "krieger",
    name: "Krieger",
    min: { MU: 12, KK: 12 },
    magic: false,
    blurb:
      "Schwert, Schild, gerade Linie. Kann etwas einstecken und ziemlich viel austeilen.",
  },
  {
    id: "streuner",
    name: "Streuner",
    min: { MU: 11, GE: 11 },
    max: { CH: 13 },
    magic: false,
    blurb:
      "Schloss, Beutel, schneller Rückzug. Lebt davon, dass keiner so genau weiß, was er gerade tut.",
  },
  {
    id: "magier",
    name: "Magier",
    min: { MU: 12, KL: 13 },
    max: { KK: 14 },
    magic: true,
    blurb:
      "Studierter Akademist. Kennt die Formeln, hasst Schmutz, vergisst nie eine Schuld.",
  },
  {
    id: "elf",
    name: "Elf",
    min: { MU: 12, IN: 13, GE: 13 },
    max: { KK: 13 },
    magic: true,
    blurb:
      "Bogen, Lieder, ein wenig Magie. Versteht die Welt anders — und meistens besser, sagt sie selbst.",
  },
  {
    id: "zwerg",
    name: "Zwerg",
    min: { MU: 12, KK: 12 },
    max: { CH: 13 },
    magic: false,
    blurb:
      "Axt, Bart, Sturheit. Geht nicht zurück, nur tiefer. Nimmt jede Beleidigung persönlich.",
  },
  {
    id: "gaukler",
    name: "Gaukler",
    min: { CH: 13, FF: 12 },
    magic: false,
    blurb:
      "Drei Bälle, ein Lied, ein falscher Name. Verlässt jede Stadt, bevor man ihn wirklich kennt.",
  },
  {
    id: "thorwaler",
    name: "Thorwaler",
    min: { MU: 13, KK: 14 },
    magic: false,
    blurb:
      "Salzwasser im Bart, Axt im Gürtel, Met im Bauch. Verhandelt selten zweimal über denselben Preis.",
  },
  {
    id: "druide",
    name: "Druide",
    min: { MU: 12, KL: 13, IN: 13 },
    magic: true,
    blurb:
      "Sichelmesser, Mistel, ein Eichenhain irgendwo. Spricht mit Tieren, wenn die Menschen ihn nerven.",
  },
];

export function getClass(id: DsaClassId): DsaClass {
  const c = DSA_CLASSES.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown DSA class: ${id}`);
  return c;
}

/** Erfüllt die Eigenschaftsmap die Voraussetzungen der Klasse? */
export function qualifiesFor(cls: DsaClass, attrs: Attrs): boolean {
  if (cls.min) {
    for (const k of Object.keys(cls.min) as Array<keyof Attrs>) {
      const need = cls.min[k];
      if (need !== undefined && attrs[k] < need) return false;
    }
  }
  if (cls.max) {
    for (const k of Object.keys(cls.max) as Array<keyof Attrs>) {
      const cap = cls.max[k];
      if (cap !== undefined && attrs[k] > cap) return false;
    }
  }
  return true;
}

/** Liste aller Klassen, für die die Eigenschaften reichen. */
export function qualifyingClasses(attrs: Attrs): DsaClass[] {
  return DSA_CLASSES.filter((c) => qualifiesFor(c, attrs));
}

/** Standard-Charaktername je Klasse, damit Layard nichts tippen muss. */
export const DEFAULT_NAME: Record<DsaClassId, string> = {
  krieger: "Hjalmar von Salzgar",
  streuner: "Knut Schattenstrich",
  magier: "Wendelmir der Genaue",
  elf: "Niamhuin Silberlied",
  zwerg: "Angbar, Sohn des Angrosch",
  gaukler: "Tjelvar mit dem doppelten Gesicht",
  thorwaler: "Asleif Walfangstochter",
  druide: "Brandil von der Eiche",
};