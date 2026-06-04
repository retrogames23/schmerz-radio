/**
 * Aventurien-Ortsverzeichnis für die Welt-Karte.
 *
 * - Koordinaten sind in Prozent (0..100) eines Hochformat-viewBox
 *   (0 = links/oben, 100 = rechts/unten) und beziehen sich auf das
 *   schematische SVG in `AventurienMap.tsx`. Wir verwenden Prozent,
 *   damit die Karte beliebig skalieren kann.
 * - "aliases" enthält alternative Schreibweisen, damit der LLM-Meister
 *   robust einen Ort erkennt (z. B. "die Reichshauptstadt" → Gareth).
 * - Das Verzeichnis ist bewusst kuratiert (~60 Orte) und nicht
 *   vollständig — unbekannte Orte werden im Marker-Update ignoriert.
 */

export type PlaceKind = "stadt" | "burg" | "tempel" | "dorf" | "ruine";

export interface DsaPlace {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  kind: PlaceKind;
  aliases?: string[];
}

/**
 * Karten-Regionen (für Beschriftung). Position ist Schwerpunkt.
 * Reine Anzeigedaten — der LLM nutzt sie als Orientierungsraster.
 */
export interface DsaRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize?: number;
}

export const DSA_REGIONS: DsaRegion[] = [
  { id: "thorwal",       name: "THORWAL",        x: 36, y: 17, fontSize: 14 },
  { id: "salamandersteine", name: "SALAMANDERSTEINE", x: 56, y: 22, fontSize: 11 },
  { id: "bornland",      name: "BORNLAND",       x: 74, y: 18, fontSize: 14 },
  { id: "kosch",         name: "KOSCH",          x: 50, y: 36, fontSize: 11 },
  { id: "svelltland",    name: "SVELLTLAND",     x: 27, y: 25, fontSize: 11 },
  { id: "andergast",     name: "ANDERGAST · NOSTRIA", x: 22, y: 36, fontSize: 10 },
  { id: "mittelreich",   name: "MITTELREICH",    x: 56, y: 47, fontSize: 16 },
  { id: "tobrien",       name: "TOBRIEN",        x: 75, y: 40, fontSize: 12 },
  { id: "maraskan",      name: "MARASKAN",       x: 91, y: 60, fontSize: 12 },
  { id: "horasreich",    name: "HORASREICH",     x: 33, y: 58, fontSize: 14 },
  { id: "almada",        name: "ALMADA",         x: 56, y: 60, fontSize: 11 },
  { id: "aranien",       name: "ARANIEN",        x: 68, y: 62, fontSize: 11 },
  { id: "khom",          name: "KHÔM-WÜSTE",     x: 50, y: 74, fontSize: 14 },
  { id: "tulamidenlande",name: "TULAMIDENLANDE", x: 60, y: 82, fontSize: 13 },
  { id: "suedaventurien",name: "SÜDAVENTURIEN",  x: 42, y: 92, fontSize: 12 },
  { id: "orkland",       name: "ORKLAND",        x: 36, y: 27, fontSize: 11 },
  { id: "neersand",      name: "NEERSAND",       x: 65, y: 11, fontSize: 10 },
];

export const DSA_PLACES: DsaPlace[] = [
  // ── Thorwal & Nordwesten ───────────────────────────────────────
  { id: "thorwal",    name: "Thorwal",    region: "Thorwal",    x: 33, y: 22, kind: "stadt", aliases: ["Thorwal-Stadt"] },
  { id: "prem",       name: "Prem",       region: "Thorwal",    x: 27, y: 30, kind: "stadt" },
  { id: "olport",     name: "Olport",     region: "Thorwal",    x: 38, y: 14, kind: "stadt" },
  { id: "skerdu",     name: "Skerdu",     region: "Thorwal",    x: 22, y: 22, kind: "stadt" },
  // ── Bornland & Nordosten ───────────────────────────────────────
  { id: "festum",     name: "Festum",     region: "Bornland",   x: 76, y: 23, kind: "stadt", aliases: ["Hauptstadt des Bornlands"] },
  { id: "norburg",    name: "Norburg",    region: "Bornland",   x: 80, y: 17, kind: "stadt" },
  { id: "riva",       name: "Riva",       region: "Bornland",   x: 70, y: 14, kind: "stadt" },
  { id: "fasar",      name: "Fasar",      region: "Khôm-Wüste", x: 64, y: 70, kind: "stadt", aliases: ["Fasar in der Wüste"] },
  // ── Mittelreich (Herzland) ─────────────────────────────────────
  { id: "gareth",     name: "Gareth",     region: "Mittelreich", x: 58, y: 49, kind: "stadt", aliases: ["Reichshauptstadt", "die Hauptstadt", "Kaiserstadt"] },
  { id: "greifenfurt",name: "Greifenfurt",region: "Mittelreich", x: 64, y: 42, kind: "stadt" },
  { id: "wehrheim",   name: "Wehrheim",   region: "Mittelreich", x: 54, y: 53, kind: "stadt" },
  { id: "trallop",    name: "Trallop",    region: "Mittelreich", x: 56, y: 41, kind: "stadt" },
  { id: "lowangen",   name: "Lowangen",   region: "Svelltland",  x: 44, y: 30, kind: "stadt" },
  { id: "ferdok",     name: "Ferdok",     region: "Kosch",       x: 52, y: 39, kind: "stadt" },
  { id: "angbar",     name: "Angbar",     region: "Kosch",       x: 50, y: 41, kind: "stadt", aliases: ["Zwergenstadt Angbar"] },
  { id: "elenvina",   name: "Elenvina",   region: "Mittelreich", x: 48, y: 35, kind: "stadt" },
  { id: "nadoret",    name: "Nadoret",    region: "Svelltland",  x: 32, y: 27, kind: "stadt" },
  { id: "salza",      name: "Salza",      region: "Mittelreich", x: 60, y: 35, kind: "stadt" },
  // ── Horasreich (Westen / Südwesten) ────────────────────────────
  { id: "vinsalt",    name: "Vinsalt",    region: "Horasreich",  x: 38, y: 59, kind: "stadt", aliases: ["Horashauptstadt"] },
  { id: "kuslik",     name: "Kuslik",     region: "Horasreich",  x: 34, y: 64, kind: "stadt" },
  { id: "havena",     name: "Havena",     region: "Albernia",    x: 30, y: 47, kind: "stadt", aliases: ["Hafenstadt Havena"] },
  { id: "punin",      name: "Punin",      region: "Horasreich",  x: 44, y: 55, kind: "stadt" },
  { id: "methumis",   name: "Methumis",   region: "Horasreich",  x: 41, y: 62, kind: "stadt" },
  { id: "joborn",     name: "Joborn",     region: "Mittelreich", x: 50, y: 50, kind: "stadt" },
  { id: "andergast",  name: "Andergast",  region: "Andergast",   x: 22, y: 38, kind: "stadt" },
  { id: "nostria",    name: "Nostria",    region: "Nostria",     x: 19, y: 41, kind: "stadt" },
  // ── Tobrien & Osten ────────────────────────────────────────────
  { id: "warunk",     name: "Warunk",     region: "Tobrien",     x: 72, y: 43, kind: "stadt" },
  { id: "perricum",   name: "Perricum",   region: "Mittelreich", x: 70, y: 50, kind: "stadt" },
  { id: "mendena",    name: "Mendena",    region: "Maraskan",    x: 91, y: 56, kind: "stadt" },
  { id: "jergan",     name: "Jergan",     region: "Maraskan",    x: 89, y: 67, kind: "stadt" },
  { id: "boran",      name: "Boran",      region: "Maraskan",    x: 92, y: 63, kind: "stadt" },
  // ── Aranien · Almada ───────────────────────────────────────────
  { id: "zorgan",     name: "Zorgan",     region: "Aranien",     x: 70, y: 58, kind: "stadt" },
  { id: "ragath",     name: "Ragath",     region: "Almada",      x: 58, y: 58, kind: "stadt" },
  { id: "harben",     name: "Harben",     region: "Almada",      x: 54, y: 62, kind: "stadt" },
  // ── Tulamidenlande & Khôm ──────────────────────────────────────
  { id: "khunchom",   name: "Khunchom",   region: "Tulamidenlande", x: 56, y: 72, kind: "stadt", aliases: ["Khunchom am Mhanadi"] },
  { id: "unau",       name: "Unau",       region: "Khôm-Wüste",     x: 52, y: 78, kind: "stadt" },
  { id: "mherwed",    name: "Mherwed",    region: "Tulamidenlande", x: 60, y: 86, kind: "stadt" },
  { id: "selem",      name: "Selem",      region: "Tulamidenlande", x: 47, y: 80, kind: "stadt" },
  { id: "thalusa",    name: "Thalusa",    region: "Tulamidenlande", x: 53, y: 88, kind: "stadt" },
  { id: "rashdul",    name: "Rashdul",    region: "Khôm-Wüste",     x: 58, y: 80, kind: "stadt" },
  // ── Südaventurien ──────────────────────────────────────────────
  { id: "alanfa",     name: "Al'Anfa",    region: "Südaventurien",  x: 44, y: 93, kind: "stadt", aliases: ["Al Anfa", "AlAnfa", "Perle des Südens"] },
  { id: "brabak",     name: "Brabak",     region: "Südaventurien",  x: 36, y: 96, kind: "stadt" },
  { id: "sylla",      name: "Sylla",      region: "Südaventurien",  x: 48, y: 96, kind: "stadt" },
  { id: "mengbilla",  name: "Mengbilla",  region: "Südaventurien",  x: 39, y: 90, kind: "stadt" },
  { id: "khefu",      name: "Khefu",      region: "Südaventurien",  x: 50, y: 92, kind: "stadt" },
  // ── Heiligtümer / Burgen / Sonstige ────────────────────────────
  { id: "drakonia",   name: "Drakonia",   region: "Bornland",       x: 78, y: 28, kind: "burg" },
  { id: "schwarze_sichel", name: "Schwarze Sichel", region: "Tobrien", x: 76, y: 47, kind: "burg" },
  { id: "tempel_praios_gareth", name: "Praios-Tempel zu Gareth", region: "Mittelreich", x: 58, y: 48, kind: "tempel", aliases: ["Praios-Tempel"] },
];

/**
 * Sucht einen Ort anhand eines Namens oder Alias (case-insensitive,
 * Diakritika-tolerant). Liefert den ersten Treffer oder `null`.
 */
export function findPlace(raw: string): DsaPlace | null {
  const q = normalize(raw);
  if (!q) return null;
  for (const p of DSA_PLACES) {
    if (normalize(p.name) === q) return p;
    for (const a of p.aliases ?? []) {
      if (normalize(a) === q) return p;
    }
  }
  // Teilstring-Fallback (nur, wenn eindeutig)
  const partials = DSA_PLACES.filter((p) => {
    const np = normalize(p.name);
    return np.includes(q) || q.includes(np);
  });
  if (partials.length === 1) return partials[0];
  return null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['`'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sortierte Liste aller Ortsnamen (für den LLM-Prompt als
 * Vorschlagsmenge — der Meister soll bevorzugt diese verwenden).
 */
export function allPlaceNames(): string[] {
  return DSA_PLACES.map((p) => p.name).sort((a, b) => a.localeCompare(b, "de"));
}