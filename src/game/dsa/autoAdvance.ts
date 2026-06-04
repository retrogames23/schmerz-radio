/**
 * KI-Auto-Steigerung: verteilt verfügbare AP eines Helden nach einer
 * deterministischen Heuristik (greedy nach Gewicht/Kosten), bevorzugt
 * Klassen-Kernattribute, eigene Hauszauber und bereits gelernte Talente.
 *
 * Reine Funktion — kein LLM-Aufruf, keine Seiteneffekte. Nutzt die
 * bestehende `applyAdvancement`-Pipeline, damit Buchführung
 * (apSpent, LE/AE-Folgen) konsistent bleibt.
 */
import type { Attr } from "@/game/dsa/dice";
import { ATTR_ORDER } from "@/game/dsa/dice";
import type { DsaHero } from "@/game/types";
import {
  applyAdvancement,
  availableAp,
  isMagicClass,
  listAllTalents,
  ownsSpellSchool,
  previewCost,
  type Advancement,
} from "./advancement";
import { SPELLS } from "./rules/spells";

const ATTR_CAP = 16;
const TALENT_CAP = 12;
const SPELL_CAP = 12;
const MAX_ITER = 200;

/** Klassen-Kernattribute → kleiner Gewicht-Boost. */
const CORE_ATTRS: Record<string, ReadonlyArray<Attr>> = {
  krieger: ["KK", "MU"],
  streuner: ["GE", "FF"],
  magier: ["KL", "IN"],
  elf: ["GE", "IN"],
  zwerg: ["KK", "MU"],
  gaukler: ["CH", "FF"],
  thorwaler: ["KK", "MU"],
  druide: ["IN", "KL"],
};

function attrWeight(hero: DsaHero, attr: Attr): number {
  const core = CORE_ATTRS[hero.classId] ?? [];
  return core.includes(attr) ? 3.0 : 1.6;
}

function talentWeight(hero: DsaHero, id: string): number {
  // Bereits gelernte Talente haben höheres Gewicht (vertiefen statt verzetteln).
  const cur = hero.talents[id];
  if (cur === undefined) return 0; // niemals neue Talente automatisch lernen
  if (cur >= 7) return 1.4;
  if (cur >= 4) return 1.8;
  return 2.2;
}

function spellWeight(hero: DsaHero, id: string): number {
  const cur = hero.spells[id];
  if (cur === undefined) return 0; // KI lernt keine neuen Sprüche von selbst
  const own = ownsSpellSchool(hero.classId, id);
  if (!own) return 0.8;
  if (cur >= 7) return 1.3;
  if (cur >= 4) return 1.7;
  return 2.0;
}

interface Candidate {
  adv: Advancement;
  weight: number;
}

function listCandidates(hero: DsaHero): Candidate[] {
  const out: Candidate[] = [];

  for (const a of ATTR_ORDER) {
    const cur = (hero.attrs as Record<string, number>)[a] ?? 0;
    if (cur >= ATTR_CAP) continue;
    out.push({ adv: { kind: "attr", attr: a as Attr }, weight: attrWeight(hero, a as Attr) });
  }

  for (const t of listAllTalents()) {
    const cur = hero.talents[t.id];
    if (cur === undefined || cur >= TALENT_CAP) continue;
    const w = talentWeight(hero, t.id);
    if (w <= 0) continue;
    out.push({ adv: { kind: "talent", id: t.id }, weight: w });
  }

  if (isMagicClass(hero.classId)) {
    for (const s of SPELLS) {
      const cur = hero.spells[s.id];
      if (cur === undefined || cur >= SPELL_CAP) continue;
      const w = spellWeight(hero, s.id);
      if (w <= 0) continue;
      out.push({ adv: { kind: "spell", id: s.id }, weight: w });
    }
  }

  return out;
}

/**
 * Verteilt die verfügbaren AP eines Helden nach Heuristik. Liefert einen
 * neuen DsaHero zurück; das Original wird nicht verändert.
 */
export function autoAdvance(hero: DsaHero): DsaHero {
  let current = hero;
  for (let i = 0; i < MAX_ITER; i++) {
    const ap = availableAp(current);
    if (ap <= 0) break;
    const candidates = listCandidates(current)
      .map((c) => ({ ...c, cost: previewCost(current, c.adv) }))
      .filter((c) => c.cost > 0 && c.cost <= ap);
    if (candidates.length === 0) break;
    // Bestes Verhältnis Gewicht/Kosten — Tie-Break: günstiger zuerst.
    candidates.sort((a, b) => {
      const ra = a.weight / a.cost;
      const rb = b.weight / b.cost;
      if (rb !== ra) return rb - ra;
      return a.cost - b.cost;
    });
    const next = applyAdvancement(current, candidates[0].adv);
    if (next === current) break; // Sicherheitsnetz
    current = next;
  }
  return current;
}