/**
 * AP-Vergabe und Steigerungs-Regeln (DSA3-Stil, vereinfacht).
 *
 * - Eigenschaften kosten je `new_value * 15` AP.
 * - Talente: bis Wert 5 je `(new + 1) * 5` AP, ab 6 je `(new + 1) * 10` AP.
 * - Hauszauber (eigene Schule) wie Talente; Fremdzauber doppelt so teuer.
 * - Neuer Zauber lernen kostet 50 AP (Hauszauber) bzw. 100 AP (Fremdzauber)
 *   und beginnt bei ZfW 0.
 * - Neues Talent lernen kostet 30 AP und beginnt bei TaW 0.
 */
import { ATTR_ORDER, type Attr } from "@/game/dsa/dice";
import { TALENTS } from "@/game/dsa/rules/talents";
import { SPELLS } from "@/game/dsa/rules/spells";
import { DSA_CLASSES, type DsaClassId } from "@/game/dsa/classes";
import type { DsaCharacterSummary, DsaHero } from "@/game/types";
import { defaultGearFor, type HeroGear } from "@/game/dsa/gear";

export const AP_MIN = 0;
export const AP_MAX = 250;

/** Defaults, falls der Meister keinen [AP:…]-Marker setzt. */
export const AP_DEFAULTS: Record<"victory" | "defeat" | "aborted", number> = {
  victory: 120,
  defeat: 40,
  aborted: 0,
};

export function clampAp(raw: unknown): number {
  const n = typeof raw === "number" ? Math.round(raw) : Number.NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.max(AP_MIN, Math.min(AP_MAX, n));
}

export function attributeCost(newValue: number): number {
  return Math.max(0, newValue * 15);
}

export function talentCost(newValue: number): number {
  const base = newValue + 1;
  return newValue < 5 ? base * 5 : base * 10;
}

export function spellCost(newValue: number, ownSchool: boolean): number {
  const base = newValue + 1;
  const c = newValue < 5 ? base * 5 : base * 10;
  return ownSchool ? c : c * 2;
}

export const NEW_TALENT_COST = 30;
export const NEW_SPELL_OWN_COST = 50;
export const NEW_SPELL_OTHER_COST = 100;

/**
 * Promotet einen alten Charakter-Snapshot zu einem vollwertigen
 * `DsaHero` mit Default-Werten. Idempotent.
 */
export function upgradeToHero(c: DsaCharacterSummary | DsaHero | null): DsaHero | null {
  if (!c) return null;
  const h = c as Partial<DsaHero> & DsaCharacterSummary;
  return {
    name: c.name,
    className: c.className,
    classId: c.classId,
    attrs: { ...c.attrs },
    le: c.le,
    leMax: typeof c.leMax === "number" ? c.leMax : c.le,
    ae: c.ae,
    rerolled: !!c.rerolled,
    geschlecht: typeof (c as { geschlecht?: unknown }).geschlecht === "string"
      ? (c as { geschlecht: string }).geschlecht
      : undefined,
    portraitDataUrl:
      typeof (c as { portraitDataUrl?: unknown }).portraitDataUrl === "string"
        ? (c as { portraitDataUrl: string }).portraitDataUrl
        : undefined,
    apTotal: typeof h.apTotal === "number" ? Math.max(0, h.apTotal) : 0,
    apSpent: typeof h.apSpent === "number" ? Math.max(0, h.apSpent) : 0,
    talents:
      h.talents && typeof h.talents === "object"
        ? { ...h.talents }
        : defaultTalents(c.classId as DsaClassId),
    spells:
      h.spells && typeof h.spells === "object"
        ? { ...h.spells }
        : defaultSpells(c.classId as DsaClassId),
    adventuresPlayed:
      typeof h.adventuresPlayed === "number" ? Math.max(0, h.adventuresPlayed) : 0,
    adventuresWon:
      typeof h.adventuresWon === "number" ? Math.max(0, h.adventuresWon) : 0,
    createdAt:
      typeof h.createdAt === "string" && h.createdAt
        ? h.createdAt
        : new Date().toISOString(),
    gear: normalizeGear(h.gear, c.classId as DsaClassId),
    currentLocation:
      typeof (h as { currentLocation?: unknown }).currentLocation === "string"
        ? (h as { currentLocation: string }).currentLocation
        : undefined,
  };
}

function normalizeGear(g: HeroGear | undefined, classId: DsaClassId): HeroGear {
  if (g && typeof g === "object" && Array.isArray(g.items)) {
    return {
      weaponId: typeof g.weaponId === "string" ? g.weaponId : null,
      armorId: typeof g.armorId === "string" ? g.armorId : null,
      shieldId: typeof g.shieldId === "string" ? g.shieldId : null,
      items: g.items.slice(0, 50),
    };
  }
  return defaultGearFor(classId);
}

export function availableAp(hero: DsaHero): number {
  return Math.max(0, (hero.apTotal ?? 0) - (hero.apSpent ?? 0));
}

/** Standard-Talente bei Charaktererschaffung. Klassen-spezifische Startwerte. */
export function defaultTalents(classId: string): Record<string, number> {
  const t: Record<string, number> = {};
  switch (classId) {
    case "krieger":
      t.athletik = 3; t.selbstbeherrschung = 3; t.sinnenschaerfe = 2; t.etikette = 1;
      break;
    case "streuner":
      t.schleichen = 4; t.sich_verstecken = 4; t.taschendiebstahl = 4; t.gassenwissen = 4;
      t.schloesser = 3; t.sinnenschaerfe = 3;
      break;
    case "magier":
      t.alchimie = 3; t.magiekunde = 5; t.geschichte = 3; t.goetter_kulte = 3; t.rechnen = 4;
      break;
    case "elf":
      t.sinnenschaerfe = 5; t.wildnisleben = 4; t.faehrtenlesen = 4; t.schleichen = 3;
      t.tierkunde = 3; t.musizieren = 4;
      break;
    case "zwerg":
      t.athletik = 3; t.schmieden = 5; t.selbstbeherrschung = 4; t.sinnenschaerfe = 3;
      break;
    case "gaukler":
      t.musizieren = 5; t.ueberreden = 4; t.taschendiebstahl = 3; t.menschenkenntnis = 3;
      t.athletik = 3;
      break;
    case "thorwaler":
      t.athletik = 4; t.schwimmen = 5; t.wildnisleben = 3; t.sinnenschaerfe = 3;
      t.selbstbeherrschung = 4;
      break;
    case "druide":
      t.pflanzenkunde = 5; t.tierkunde = 5; t.heilkunde_wunden = 3; t.wildnisleben = 4;
      t.goetter_kulte = 3;
      break;
    default:
      t.athletik = 2;
  }
  return t;
}

export function defaultSpells(classId: string): Record<string, number> {
  const cls = DSA_CLASSES.find((c) => c.id === classId);
  if (!cls?.magic) return {};
  const out: Record<string, number> = {};
  for (const s of SPELLS) {
    if (s.schools.includes(classId)) out[s.id] = 3;
  }
  return out;
}

export function isMagicClass(classId: string): boolean {
  return !!DSA_CLASSES.find((c) => c.id === classId)?.magic;
}

export function ownsSpellSchool(classId: string, spellId: string): boolean {
  const sp = SPELLS.find((s) => s.id === spellId);
  return !!sp?.schools.includes(classId);
}

/** Talente, die der Held überhaupt sehen/lernen soll (alle). */
export function listAllTalents() {
  return TALENTS;
}

/** Zauber, die diese Klasse lernen darf — Hauszauber zuerst, dann Fremdzauber. */
export function listSpellsForClass(classId: string) {
  if (!isMagicClass(classId)) return [];
  return [...SPELLS].sort((a, b) => {
    const aOwn = a.schools.includes(classId) ? 0 : 1;
    const bOwn = b.schools.includes(classId) ? 0 : 1;
    return aOwn - bOwn || a.name.localeCompare(b.name);
  });
}

export const ATTR_LIST: readonly Attr[] = ATTR_ORDER;

/** Wendet eine Steigerungs-Aktion auf einen Helden an (immutable). */
export type Advancement =
  | { kind: "attr"; attr: Attr }
  | { kind: "talent"; id: string }
  | { kind: "spell"; id: string };

export function previewCost(hero: DsaHero, a: Advancement): number {
  if (a.kind === "attr") {
    const cur = hero.attrs[a.attr] ?? 0;
    return attributeCost(cur + 1);
  }
  if (a.kind === "talent") {
    const cur = hero.talents[a.id];
    if (cur === undefined) return NEW_TALENT_COST;
    return talentCost(cur + 1);
  }
  const cur = hero.spells[a.id];
  const own = ownsSpellSchool(hero.classId, a.id);
  if (cur === undefined) return own ? NEW_SPELL_OWN_COST : NEW_SPELL_OTHER_COST;
  return spellCost(cur + 1, own);
}

export function applyAdvancement(hero: DsaHero, a: Advancement): DsaHero {
  const cost = previewCost(hero, a);
  if (availableAp(hero) < cost) return hero;
  const next: DsaHero = {
    ...hero,
    attrs: { ...hero.attrs },
    talents: { ...hero.talents },
    spells: { ...hero.spells },
    apSpent: hero.apSpent + cost,
  };
  if (a.kind === "attr") {
    next.attrs[a.attr] = (next.attrs[a.attr] ?? 0) + 1;
    // LE wächst mit KK (+1 pro Punkt), AE mit IN (+1 pro Punkt für Magier).
    if (a.attr === "KK") {
      next.leMax = next.leMax + 1;
      next.le = Math.min(next.leMax, next.le + 1);
    }
    if (a.attr === "IN" && next.ae !== null) {
      next.ae = next.ae + 1;
    }
  } else if (a.kind === "talent") {
    next.talents[a.id] = (next.talents[a.id] ?? -1) + 1;
    if (hero.talents[a.id] === undefined) {
      // Neues Talent beginnt bei 0
      next.talents[a.id] = 0;
    }
  } else {
    next.spells[a.id] = (next.spells[a.id] ?? -1) + 1;
    if (hero.spells[a.id] === undefined) {
      next.spells[a.id] = 0;
    }
  }
  return next;
}