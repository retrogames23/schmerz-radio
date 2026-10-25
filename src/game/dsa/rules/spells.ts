/**
 * Zauberliste (DSA3-Stil) — reine Mechanik-Felder.
 *
 * Beschreibungen sind bewusst kurz und in eigenen Worten, damit der LLM-Meister
 * Wirkung und Probenformel kennt, ohne dass Originaltexte reproduziert werden.
 *
 * Felder:
 *   probe   — die drei Eigenschaften für die 3W20-Probe
 *   cost    — AsP-Kosten (Zahl ODER kurze Formel als String, z. B. "KK/2")
 *   range   — Reichweite (Stichwort)
 *   target  — Ziel (Selbst | Berührung | Sicht | Bereich)
 *   effect  — eigene, knappe Wirkungsbeschreibung
 */
import type { AttributeId } from "./mechanics";

export interface SpellDef {
  id: string;
  name: string;
  probe: [AttributeId, AttributeId, AttributeId];
  cost: string;
  range: string;
  target: "Selbst" | "Berührung" | "Sicht" | "Bereich";
  effect: string;
  schools: string[]; // Klassen, die den Zauber als Hauszauber haben (Mod -3)
  /** Mindestkosten in AsP — Voraussetzung, um den Spruch überhaupt zu beginnen. */
  minCost: number;
  /**
   * Einsatz im rundenbasierten Kampf (DSA3-Zauberdauer ≤ wenige Sekunden).
   * Fehlt das Feld, ist der Spruch im Kampf nicht wirkbar (z. B. Balsam
   * Salabunde: Zauberdauer 1 Spielrunde).
   */
  combat?: "damage" | "blind" | "control" | "buff";
}

export const SPELLS: SpellDef[] = [
  {
    id: "flim_flam",
    name: "Flim Flam",
    probe: ["KL", "IN", "CH"],
    cost: "2",
    range: "Sicht",
    target: "Bereich",
    effect: "Erzeugt eine kleine, frei schwebende Lichtquelle.",
    schools: ["magier", "elf"],
    minCost: 1,
  },
  {
    id: "blitz_dich_find",
    name: "Blitz dich find",
    probe: ["MU", "KL", "FF"],
    cost: "5",
    range: "Sicht",
    target: "Sicht",
    effect: "Grelle Lichtblendung: das Ziel ist für ZfP* Kampfrunden geblendet (AT/PA −5).",
    schools: ["magier", "elf"],
    minCost: 5,
    combat: "blind",
  },
  {
    id: "ignifaxius",
    name: "Ignifaxius",
    probe: ["KL", "GE", "FF"],
    cost: "1 pro TP",
    range: "Sicht",
    target: "Sicht",
    effect: "Feuerlanze: bis Stufe+1 W6 TP, AsP = erzielte TP, je 10 TP sinkt der RS des Opfers um 1.",
    schools: ["magier"],
    minCost: 6,
    combat: "damage",
  },
  {
    id: "fulminictus",
    name: "Fulminictus",
    probe: ["KL", "GE", "KK"],
    cost: "1 pro SP",
    range: "Sicht",
    target: "Sicht",
    effect: "Magischer Schlag, 3W6+Stufe SP, durchdringt jede Rüstung; AsP = zugefügte SP.",
    schools: ["magier", "elf"],
    minCost: 3,
    combat: "damage",
  },
  {
    id: "balsam_salabunde",
    name: "Balsam Salabunde",
    probe: ["KL", "IN", "CH"],
    cost: "1 pro LP, mind. 7",
    range: "Berührung",
    target: "Berührung",
    effect: "Heilt 1 LE pro AsP (mind. 7 AsP); Zauberdauer 1 Spielrunde — nicht im Kampfgetümmel.",
    schools: ["magier", "elf", "druide"],
    minCost: 7,
  },
  {
    id: "horriphobus",
    name: "Horriphobus",
    probe: ["MU", "IN", "CH"],
    cost: "7",
    range: "Sicht",
    target: "Sicht",
    effect: "Das Ziel flieht schreiend oder kauert sich angsterfüllt zusammen (3 Spielrunden).",
    schools: ["magier"],
    minCost: 7,
    combat: "control",
  },
  {
    id: "bannbaladin",
    name: "Bannbaladin",
    probe: ["IN", "CH", "CH"],
    cost: "8",
    range: "Sicht",
    target: "Sicht",
    effect: "Das Ziel hält den Zauberer für seinen besten Freund (Probe +MR); es stellt den Kampf ein.",
    schools: ["magier", "elf"],
    minCost: 8,
    combat: "control",
  },
  {
    id: "armatrutz",
    name: "Armatrutz",
    probe: ["IN", "GE", "KK"],
    cost: "RS×RS, mind. 4",
    range: "Berührung",
    target: "Berührung",
    effect: "Unsichtbare Rüstung ohne Behinderung, RS-Zuwachs für einen Kampf; Kosten RS×RS AsP.",
    schools: ["magier"],
    minCost: 4,
    combat: "buff",
  },
  {
    id: "axxeleratus",
    name: "Axxeleratus",
    probe: ["KL", "GE", "KK"],
    cost: "7",
    range: "Berührung",
    target: "Berührung",
    effect: "Verdoppelt die Geschwindigkeit für 20 KR: AT und PA je +2.",
    schools: ["magier", "elf"],
    minCost: 7,
    combat: "buff",
  },
  {
    id: "adlerauge",
    name: "Adlerauge",
    probe: ["KL", "IN", "FF"],
    cost: "4",
    range: "Selbst",
    target: "Selbst",
    effect: "Sehschärfe stark erhöht für eine Spielstunde.",
    schools: ["magier", "elf"],
    minCost: 4,
  },
  {
    id: "manifesto",
    name: "Manifesto",
    probe: ["KL", "KL", "FF"],
    cost: "3",
    range: "Berührung",
    target: "Berührung",
    effect: "Macht Unsichtbares oder Geister kurzzeitig sichtbar.",
    schools: ["magier"],
    minCost: 3,
  },
  {
    id: "odem_arcanum",
    name: "Odem Arcanum",
    probe: ["KL", "KL", "IN"],
    cost: "2",
    range: "Sicht",
    target: "Sicht",
    effect: "Zauberer erkennt magische Auren und ihre Stärke.",
    schools: ["magier", "elf", "druide"],
    minCost: 2,
  },
  // === Druidische Hauszauber (DSA3) ===
  {
    id: "herr_der_tiere",
    name: "Herr der Tiere",
    probe: ["MU", "IN", "CH"],
    cost: "7",
    range: "Sicht",
    target: "Sicht",
    effect: "Beruhigt oder lenkt ein wildes Tier; folgt kurzzeitig dem Druiden.",
    schools: ["druide"],
    minCost: 7,
  },
  {
    id: "kroetensprung",
    name: "Krötensprung",
    probe: ["MU", "IN", "GE"],
    cost: "5",
    range: "Selbst",
    target: "Selbst",
    effect: "Erlaubt einen weiten, sicheren Sprung über Hindernisse oder Abgründe.",
    schools: ["druide"],
    minCost: 5,
  },
  {
    id: "pentagramma",
    name: "Pentagramma",
    probe: ["KL", "IN", "CH"],
    cost: "10",
    range: "Berührung",
    target: "Bereich",
    effect: "Schutzkreis gegen Dämonen und niedere Geister; hält mehrere Stunden.",
    schools: ["druide", "magier"],
    minCost: 10,
  },
  {
    id: "wolkenruf",
    name: "Wolkenruf",
    probe: ["MU", "KL", "CH"],
    cost: "12",
    range: "Sicht",
    target: "Bereich",
    effect: "Ruft Wolken oder leichten Regen herbei; verändert das Wetter lokal.",
    schools: ["druide"],
    minCost: 12,
  },
  {
    id: "wurzelgriff",
    name: "Wurzelgriff",
    probe: ["MU", "KL", "FF"],
    cost: "6",
    range: "Sicht",
    target: "Sicht",
    effect: "Wurzeln umschlingen ein Ziel am Boden; es kann für ZfP* Kampfrunden nicht angreifen (PA −4).",
    schools: ["druide"],
    minCost: 6,
    combat: "control",
  },
];

export function spellsForPrompt(): string {
  const rows = SPELLS.map(
    (s) => `  ${s.name.padEnd(20)} (${s.probe.join("/")}) Kosten ${s.cost.padEnd(10)} ${s.target} — ${s.effect}`,
  );
  return ["ZAUBER (3W20 gegen die drei Eigenschaften; Hauszauber: Probe -3 erleichtert):", ...rows].join("\n");
}

/** Im rundenbasierten Kampf wirkbare Sprüche. */
export const COMBAT_SPELL_IDS: ReadonlySet<string> = new Set(
  SPELLS.filter((s) => s.combat).map((s) => s.id),
);
