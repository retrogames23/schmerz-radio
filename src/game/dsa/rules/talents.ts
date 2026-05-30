/**
 * Talent-Liste (DSA3-Stil) mit den drei Probe-Eigenschaften.
 *
 * Reine Spielwerte (Probenformel). Wird vom Meister verwendet, wenn er
 * [CHECK: ...] auf ein Talent setzen möchte oder NSC-Fähigkeiten einschätzt.
 */
import type { AttributeId } from "./mechanics";

export interface TalentDef {
  id: string;
  name: string;
  probe: [AttributeId, AttributeId, AttributeId];
  category: "koerper" | "gesellschaft" | "natur" | "wissen" | "handwerk" | "kampf";
}

export const TALENTS: TalentDef[] = [
  // Körper
  { id: "klettern",      name: "Klettern",          probe: ["MU", "GE", "KK"], category: "koerper" },
  { id: "schleichen",    name: "Schleichen",        probe: ["MU", "IN", "GE"], category: "koerper" },
  { id: "sich_verstecken", name: "Sich verstecken", probe: ["MU", "IN", "GE"], category: "koerper" },
  { id: "schwimmen",     name: "Schwimmen",         probe: ["GE", "KK", "KK"], category: "koerper" },
  { id: "athletik",      name: "Athletik / Akrobatik", probe: ["MU", "GE", "KK"], category: "koerper" },
  { id: "selbstbeherrschung", name: "Selbstbeherrschung", probe: ["MU", "MU", "KK"], category: "koerper" },
  { id: "sinnenschaerfe", name: "Sinnenschärfe",    probe: ["KL", "IN", "IN"], category: "koerper" },

  // Gesellschaft
  { id: "ueberreden",    name: "Überreden",         probe: ["MU", "IN", "CH"], category: "gesellschaft" },
  { id: "menschenkenntnis", name: "Menschenkenntnis", probe: ["KL", "IN", "CH"], category: "gesellschaft" },
  { id: "gassenwissen",  name: "Gassenwissen",      probe: ["KL", "IN", "CH"], category: "gesellschaft" },
  { id: "feilschen",     name: "Feilschen",         probe: ["KL", "IN", "CH"], category: "gesellschaft" },
  { id: "lehren",        name: "Lehren",            probe: ["KL", "IN", "CH"], category: "gesellschaft" },
  { id: "etikette",      name: "Etikette",          probe: ["KL", "IN", "CH"], category: "gesellschaft" },

  // Natur
  { id: "faehrtenlesen", name: "Fährtensuchen",     probe: ["KL", "IN", "GE"], category: "natur" },
  { id: "orientierung",  name: "Orientierung",      probe: ["KL", "IN", "IN"], category: "natur" },
  { id: "wildnisleben",  name: "Wildnisleben",      probe: ["MU", "IN", "GE"], category: "natur" },
  { id: "tierkunde",     name: "Tierkunde",         probe: ["MU", "KL", "CH"], category: "natur" },
  { id: "pflanzenkunde", name: "Pflanzenkunde",     probe: ["KL", "IN", "FF"], category: "natur" },

  // Wissen
  { id: "alchimie",      name: "Alchimie",          probe: ["KL", "KL", "FF"], category: "wissen" },
  { id: "geographie",    name: "Geographie",        probe: ["KL", "KL", "IN"], category: "wissen" },
  { id: "geschichte",    name: "Geschichte",        probe: ["KL", "KL", "IN"], category: "wissen" },
  { id: "goetter_kulte", name: "Götter & Kulte",    probe: ["KL", "KL", "IN"], category: "wissen" },
  { id: "magiekunde",    name: "Magiekunde",        probe: ["KL", "KL", "IN"], category: "wissen" },
  { id: "kriegskunst",   name: "Kriegskunst",       probe: ["MU", "KL", "IN"], category: "wissen" },
  { id: "rechnen",       name: "Rechnen",           probe: ["KL", "KL", "IN"], category: "wissen" },

  // Handwerk
  { id: "heilkunde_wunden", name: "Heilkunde: Wunden", probe: ["KL", "CH", "FF"], category: "handwerk" },
  { id: "heilkunde_gift",   name: "Heilkunde: Gift",   probe: ["MU", "KL", "IN"], category: "handwerk" },
  { id: "schloesser",    name: "Schlösser knacken", probe: ["IN", "FF", "FF"], category: "handwerk" },
  { id: "taschendiebstahl", name: "Taschendiebstahl", probe: ["MU", "FF", "GE"], category: "handwerk" },
  { id: "musizieren",    name: "Musizieren",        probe: ["CH", "FF", "KK"], category: "handwerk" },
  { id: "schmieden",     name: "Schmieden",         probe: ["FF", "KK", "KK"], category: "handwerk" },
];

export function talentsForPrompt(): string {
  const rows = TALENTS.map(
    (t) => `  ${t.name.padEnd(24)} (${t.probe.join("/")})`,
  );
  return ["TALENTE (Probe = die drei Eigenschaften in Klammern):", ...rows].join("\n");
}