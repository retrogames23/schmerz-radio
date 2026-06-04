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
  },
  {
    id: "blitz_dich_find",
    name: "Blitz dich find",
    probe: ["MU", "KL", "FF"],
    cost: "6",
    range: "Sicht",
    target: "Sicht",
    effect: "Elektrischer Blitz, 1W+ZfW Schaden, Rüstung halb wirksam.",
    schools: ["magier", "elf"],
  },
  {
    id: "ignifaxius",
    name: "Ignifaxius",
    probe: ["MU", "KL", "KK"],
    cost: "8",
    range: "Sicht",
    target: "Sicht",
    effect: "Stoß aus Feuer, 2W+ZfW Schaden, entzündet Brennbares.",
    schools: ["magier"],
  },
  {
    id: "fulminictus",
    name: "Fulminictus",
    probe: ["KL", "IN", "KK"],
    cost: "4",
    range: "Sicht",
    target: "Sicht",
    effect: "Druckwelle, wirft Ziele zu Boden, leichter Schaden.",
    schools: ["magier"],
  },
  {
    id: "balsam_salabunde",
    name: "Balsam Salabunde",
    probe: ["MU", "IN", "CH"],
    cost: "geheilte LE",
    range: "Berührung",
    target: "Berührung",
    effect: "Heilt LE; jeder LE kostet 1 AsP.",
    schools: ["magier", "elf"],
  },
  {
    id: "horriphobus",
    name: "Horriphobus",
    probe: ["MU", "IN", "CH"],
    cost: "7",
    range: "Sicht",
    target: "Sicht",
    effect: "Erzeugt panische Furcht beim Ziel; Flucht für mehrere Runden.",
    schools: ["magier"],
  },
  {
    id: "bannbaladin",
    name: "Bannbaladin",
    probe: ["KL", "IN", "CH"],
    cost: "8",
    range: "Sicht",
    target: "Sicht",
    effect: "Macht das Ziel dem Zauberer für kurze Zeit freundlich gesinnt.",
    schools: ["magier", "elf"],
  },
  {
    id: "armatrutz",
    name: "Armatrutz",
    probe: ["KL", "KL", "KK"],
    cost: "7",
    range: "Berührung",
    target: "Berührung",
    effect: "+2 RS für mehrere Kampfrunden.",
    schools: ["magier"],
  },
  {
    id: "axxeleratus",
    name: "Axxeleratus",
    probe: ["MU", "IN", "GE"],
    cost: "8",
    range: "Berührung",
    target: "Berührung",
    effect: "Verdoppelt Aktionen pro Kampfrunde für wenige Runden.",
    schools: ["magier"],
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
  },
  {
    id: "odem_arcanum",
    name: "Odem Arcanum",
    probe: ["KL", "KL", "IN"],
    cost: "2",
    range: "Sicht",
    target: "Sicht",
    effect: "Zauberer erkennt magische Auren und ihre Stärke.",
    schools: ["magier", "elf"],
  },
];

export function spellsForPrompt(): string {
  const rows = SPELLS.map(
    (s) => `  ${s.name.padEnd(20)} (${s.probe.join("/")}) Kosten ${s.cost.padEnd(10)} ${s.target} — ${s.effect}`,
  );
  return ["ZAUBER (3W20 gegen die drei Eigenschaften; Hauszauber: Probe -3 erleichtert):", ...rows].join("\n");
}