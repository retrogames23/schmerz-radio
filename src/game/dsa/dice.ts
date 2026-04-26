/**
 * Würfelt 1W6 + 7 → Wert in [8..13]. Eigenschaftswurf nach DSA 2.
 */
export function roll1d6plus7(): number {
  return Math.floor(Math.random() * 6) + 1 + 7;
}

/**
 * Standard-W6, ergibt 1..6.
 */
export function roll1d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Reihenfolge der sieben Eigenschaften nach DSA 2.
 */
export const ATTR_ORDER = [
  "MU",
  "KL",
  "CH",
  "FF",
  "GE",
  "IN",
  "KK",
] as const;

export type Attr = (typeof ATTR_ORDER)[number];

export type Attrs = Record<Attr, number>;

export const ATTR_LABEL: Record<Attr, string> = {
  MU: "Mut",
  KL: "Klugheit",
  CH: "Charisma",
  FF: "Fingerfertigkeit",
  GE: "Gewandtheit",
  IN: "Intuition",
  KK: "Körperkraft",
};

/**
 * Lebensenergie nach DSA 2 (vereinfachte Held-Variante):
 * KK + 1W6 + 15.
 */
export function rollLE(kk: number): number {
  return kk + roll1d6() + 15;
}

/**
 * Astralenergie für magiebegabte Klassen: MU + IN + 1W6 + 10.
 */
export function rollAE(mu: number, intu: number): number {
  return mu + intu + roll1d6() + 10;
}