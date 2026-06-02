/**
 * Rüstungs-Tabelle (DSA3-kompatibel, stark vereinfacht).
 *
 * Reine Spielwerte. Wirken sich nur auf RS (Schaden absorbieren) und —
 * für Schilde — auf den PA-Bonus aus. Keine Behinderung, kein Gewicht,
 * kein Bruchfaktor (bewusste Vereinfachung für die Tafelrunde).
 */
export interface ArmorStats {
  id: string;
  name: string;
  /** Rüstungsschutz (wird vom Schaden abgezogen). */
  rs: number;
  /** Falls ein Schild: zusätzlicher PA-Bonus. Sonst 0. */
  paBonus?: number;
  /** "armor" = am Körper, "shield" = in der Hand. */
  kind: "armor" | "shield";
}

export const ARMORS: Record<string, ArmorStats> = {
  keine:            { id: "keine",            name: "ohne Rüstung",   rs: 0, kind: "armor" },
  robe:             { id: "robe",              name: "Magierrobe",     rs: 0, kind: "armor" },
  lederwams:        { id: "lederwams",         name: "Lederwams",      rs: 1, kind: "armor" },
  lederruestung:    { id: "lederruestung",     name: "Lederrüstung",   rs: 2, kind: "armor" },
  kettenhemd:       { id: "kettenhemd",        name: "Kettenhemd",     rs: 3, kind: "armor" },
  schuppenpanzer:   { id: "schuppenpanzer",    name: "Schuppenpanzer", rs: 4, kind: "armor" },
  plattenharnisch:  { id: "plattenharnisch",   name: "Plattenharnisch",rs: 5, kind: "armor" },

  buckler:          { id: "buckler",           name: "Buckler",        rs: 0, paBonus: 1, kind: "shield" },
  rundschild:       { id: "rundschild",        name: "Rundschild",     rs: 0, paBonus: 2, kind: "shield" },
  reiterschild:     { id: "reiterschild",      name: "Reiterschild",   rs: 0, paBonus: 3, kind: "shield" },
};

export function armorsForPrompt(): string {
  const body: string[] = [];
  body.push("RÜSTUNG (DSA3, vereinfacht):");
  for (const a of Object.values(ARMORS)) {
    if (a.kind === "armor") {
      body.push(`  ${a.name.padEnd(18)} RS ${a.rs}`);
    }
  }
  body.push("SCHILDE:");
  for (const a of Object.values(ARMORS)) {
    if (a.kind === "shield") {
      body.push(`  ${a.name.padEnd(18)} PA+${a.paBonus ?? 0}`);
    }
  }
  return body.join("\n");
}