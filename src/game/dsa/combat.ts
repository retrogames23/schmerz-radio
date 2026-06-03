import type { Attrs } from "./dice";
import type { DsaClassId } from "./classes";
import type { DsaCharacterSummary } from "@/game/types";
import { SPELLS, type SpellDef } from "./rules/spells";
import type { AttributeId } from "./rules/mechanics";
import { WEAPONS } from "./rules/weapons";
import { ARMORS } from "./rules/armor";
import type { HeroGear } from "./gear";
import type { CombatIntent, CompanionIntent } from "./combatIntent";
import { EMPTY_COMBAT_INTENT, mergeCombatIntents, YELVA_DEFAULT_SPELLS } from "./combatIntent";

/**
 * Vereinfachte DSA-Kampfregeln für die automatischen Tafelrunden-Kämpfe.
 *
 * Ablauf einer Runde:
 *   1. Initiative entscheidet, wer angreift (MU-basiert + W6).
 *   2. Angreifer würfelt 1W20 — Treffer wenn ≤ AT.
 *   3. Trifft er, würfelt der Verteidiger 1W20 — Parade wenn ≤ PA.
 *   4. Wird nicht pariert: TP = Würfel + Bonus − RS des Verteidigers (min. 1).
 *   5. LE des Getroffenen sinkt. Bei LE ≤ 0 ist die Figur kampfunfähig.
 *
 * Spielerwerte werden aus dem DSA-Charakterbogen abgeleitet, Gegnerwerte
 * aus der ENEMY_STATS-Tabelle.
 */

export type CombatantSide = "hero" | "foe";

/** Position einer Figur im Kampf. */
export type CombatantRole = "frontline" | "backline" | "support";

export interface Combatant {
  id: string;
  name: string;
  side: CombatantSide;
  /** Lebensenergie aktuell. */
  le: number;
  /** Lebensenergie max. (für Balken). */
  leMax: number;
  /** Attacke-Wert (1W20 ≤ AT trifft). */
  at: number;
  /** Parade-Wert (1W20 ≤ PA pariert). */
  pa: number;
  /** Trefferpunkte-Würfel-Anzahl (W6). */
  tpDice: number;
  /** Trefferpunkte-Bonus (flach). */
  tpBonus: number;
  /** Rüstungsschutz, vom Schaden abgezogen. */
  rs: number;
  /** Initiative-Basis (MU oder Klassendefault). */
  iniBase: number;
  /** Waffenname für Log. */
  weapon: string;
  /** Kurzer Flavor-Satz, der einmal beim Auftritt erscheint. */
  intro?: string;
  /** Eigenschaften des Helden — nur gesetzt für Layard, gebraucht für Zauberproben. */
  attrs?: Attrs;
  /** Aktuelle Astralpunkte (nur Magier/Elf-Held). */
  ae?: number;
  /** AE-Maximum (für die Anzeige). */
  aeMax?: number;
  /** Gelernte Zauber id→ZfW (nur Layard, wenn magisch begabt). */
  spells?: Record<string, number>;
  /** Klassen-ID für Hauszauber-Erleichterung. */
  classId?: DsaClassId;
  /** Position in der Schlachtordnung. Default: frontline. */
  role?: CombatantRole;
  /** Bevorzugte Fernkampf-Variante (für Log-Beschreibung). */
  rangedWeapon?: string;
}

export interface EnemyStat {
  id: string;
  name: string;
  le: number;
  at: number;
  pa: number;
  tpDice: number;
  tpBonus: number;
  rs: number;
  iniBase: number;
  weapon: string;
  intro?: string;
}

/**
 * Gegner-Charakterbögen für die Kampagne. Werte sind bewusst moderat —
 * ein einzelner Gegner ist machbar, mehrere zusammen werden gefährlich.
 */
export const ENEMY_STATS: Record<string, EnemyStat> = {
  wegelagerer_anfuehrer: {
    id: "wegelagerer_anfuehrer",
    name: "Anführer der Wegelagerer",
    le: 22,
    at: 11,
    pa: 9,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 11,
    weapon: "Kurzschwert",
    intro: "Gebrochene Nase, breites Grinsen, ruhige Hand am Schwertgriff.",
  },
  wegelagerer_armbrust: {
    id: "wegelagerer_armbrust",
    name: "Armbrustschütze",
    le: 14,
    at: 10,
    pa: 7,
    tpDice: 1,
    tpBonus: 2,
    rs: 0,
    iniBase: 9,
    weapon: "leichte Armbrust",
  },
  wegelagerer_stab: {
    id: "wegelagerer_stab",
    name: "Wegelagerer mit Knüppel",
    le: 16,
    at: 9,
    pa: 8,
    tpDice: 1,
    tpBonus: 1,
    rs: 0,
    iniBase: 10,
    weapon: "Knüppel",
  },
  glatzkopf: {
    id: "glatzkopf",
    name: "Glatzköpfiger Söldner",
    le: 24,
    at: 11,
    pa: 9,
    tpDice: 1,
    tpBonus: 3,
    rs: 1,
    iniBase: 10,
    weapon: "Faust wie ein Schmiedehammer",
    intro: "Massig, schwitzend, riecht nach Bier und schlechter Laune.",
  },
  spiegelhueter: {
    id: "spiegelhueter",
    name: "Hüter des Spiegels",
    le: 30,
    at: 12,
    pa: 11,
    tpDice: 1,
    tpBonus: 3,
    rs: 2,
    iniBase: 14,
    weapon: "Schattenklinge",
    intro:
      "Eine Gestalt, geformt aus euren eigenen Umrissen. Sie spricht mit Wendelmirs Stimme.",
  },
  spiegelhueter_zornig: {
    id: "spiegelhueter_zornig",
    name: "Hüter des Spiegels (zornig)",
    le: 36,
    at: 13,
    pa: 12,
    tpDice: 1,
    tpBonus: 4,
    rs: 3,
    iniBase: 15,
    weapon: "Schattenklinge",
    intro:
      "Die Gestalt zittert vor Zorn — die Krypta ist geschändet, der Spiegel weiß es.",
  },
  spiegelhueter_milde: {
    id: "spiegelhueter_milde",
    name: "Hüter des Spiegels (versöhnlich)",
    le: 24,
    at: 11,
    pa: 10,
    tpDice: 1,
    tpBonus: 2,
    rs: 2,
    iniBase: 13,
    weapon: "Schattenklinge",
    intro:
      "Die Gestalt nickt euch zu, müde. Sie kämpft, weil sie muss — nicht weil sie will.",
  },
  sumpfwurm: {
    id: "sumpfwurm",
    name: "Sumpfwurm",
    le: 18,
    at: 10,
    pa: 6,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 8,
    weapon: "Bisszähne",
    intro: "Etwas Schleimiges hebt sich aus dem Morast — drei Mannslängen lang.",
  },
  bandit_revenant: {
    id: "bandit_revenant",
    name: "Wegelagerer-Anführer (zurück)",
    le: 26,
    at: 12,
    pa: 10,
    tpDice: 1,
    tpBonus: 3,
    rs: 2,
    iniBase: 12,
    weapon: "Kurzschwert (mit Hass geschliffen)",
    intro:
      "Du erkennst die gebrochene Nase sofort. „Ich hab dir geschworen, wir sehen uns wieder.“",
  },
  // ── Übergriffe innerhalb der Tafelrunde ──────────────────────────
  // Wenn Layard tatsächlich Brem oder Yelva angreift, darf der Meister
  // diese IDs für [COMBAT: …] nutzen. Werte: kompetent, aber nicht
  // tödlich — die beiden gehen lieber in Deckung, schreien nach Wache
  // oder hauen ab, statt Layard kaltzumachen.
  brem_npc: {
    id: "brem_npc",
    name: "Brem (verteidigt sich)",
    le: 26,
    at: 12,
    pa: 12,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 13,
    weapon: "Dolch & dreckige Tricks",
    intro:
      "Brem springt zwei Schritte zurück, der Dolch ist plötzlich in seiner Hand. „Layard — bist du WAHNSINNIG?“",
  },
  yelva_npc: {
    id: "yelva_npc",
    name: "Yelva (verteidigt sich)",
    le: 22,
    at: 11,
    pa: 12,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 14,
    weapon: "Säbel, dazu ein scharfes Wort",
    intro:
      "Yelvas Augen werden schmal. Der Säbel zischt aus der Scheide. „Das willst du nicht wirklich, Mensch.“",
  },
};

/** Klassen-Profile für die Spielerableitung. Exportiert, damit der
 *  Charakterbogen-Overlay die abgeleiteten Werte zeigen kann. */
export const CLASS_COMBAT_PROFILES: Record<
  DsaClassId,
  { atBase: number; paBase: number; tpDice: number; tpBonus: number; rs: number; weapon: string }
> = {
  krieger:    { atBase: 12, paBase: 11, tpDice: 1, tpBonus: 4, rs: 4, weapon: "Anderthalbhänder" },
  thorwaler:  { atBase: 12, paBase: 10, tpDice: 2, tpBonus: 2, rs: 3, weapon: "Streitaxt" },
  zwerg:      { atBase: 11, paBase: 11, tpDice: 1, tpBonus: 4, rs: 4, weapon: "Zwergenaxt" },
  streuner:   { atBase: 11, paBase: 10, tpDice: 1, tpBonus: 2, rs: 1, weapon: "Dolch & List" },
  gaukler:    { atBase: 10, paBase: 11, tpDice: 1, tpBonus: 2, rs: 1, weapon: "Rapier" },
  elf:        { atBase: 12, paBase: 10, tpDice: 1, tpBonus: 3, rs: 2, weapon: "Elfenbogen / Säbel" },
  magier:     { atBase: 9,  paBase: 9,  tpDice: 1, tpBonus: 1, rs: 0, weapon: "Magierstab" },
  druide:     { atBase: 10, paBase: 10, tpDice: 1, tpBonus: 2, rs: 1, weapon: "Sichelmesser" },
};

/** Wandelt den Spielercharakter in einen Combatant um. */
export function heroCombatantFromCharacter(
  ch: DsaCharacterSummary,
  hero?: { spells?: Record<string, number>; gear?: HeroGear } | null,
): Combatant {
  const profile =
    CLASS_COMBAT_PROFILES[(ch.classId as DsaClassId)] ??
    CLASS_COMBAT_PROFILES.streuner;
  const a = ch.attrs as Attrs;
  // Eigenschaften beeinflussen AT/PA leicht (vereinfacht):
  //   AT-Bonus = (KK-11 + GE-11) / 2, abgerundet.
  //   PA-Bonus = (GE-11 + IN-11) / 2, abgerundet.
  const atBonus = Math.floor(((a.KK - 11) + (a.GE - 11)) / 2);
  const paBonus = Math.floor(((a.GE - 11) + (a.IN - 11)) / 2);
  const tpKKBonus = Math.max(0, Math.floor((a.KK - 12) / 2));
  const spells =
    hero?.spells && typeof hero.spells === "object" ? hero.spells : undefined;

  // Ausrüstung: Waffe ersetzt TP-Würfel/Bonus und liefert AT/PA-Modifikatoren,
  // Rüstung ersetzt RS, Schild gibt zusätzlich PA-Bonus.
  const gear = hero?.gear;
  const weapon = gear?.weaponId ? WEAPONS[gear.weaponId] : null;
  const armor = gear?.armorId ? ARMORS[gear.armorId] : null;
  const shield = gear?.shieldId ? ARMORS[gear.shieldId] : null;

  let tpDice = profile.tpDice;
  let tpBonus = profile.tpBonus + tpKKBonus;
  let weaponName = profile.weapon;
  let weaponAtMod = 0;
  let weaponPaMod = 0;
  if (weapon) {
    const parsed = parseTp(weapon.tp);
    tpDice = parsed.dice;
    tpBonus = parsed.bonus + tpKKBonus;
    weaponName = weapon.name;
    weaponAtMod = weapon.at;
    weaponPaMod = weapon.pa;
  }

  let rs = profile.rs;
  if (armor) rs = armor.rs;

  let shieldPa = 0;
  if (shield && shield.kind === "shield") shieldPa = shield.paBonus ?? 0;

  return {
    id: "hero",
    name: ch.name,
    side: "hero",
    le: ch.le,
    leMax: ch.leMax ?? ch.le,
    at: profile.atBase + atBonus + weaponAtMod,
    pa: profile.paBase + paBonus + weaponPaMod + shieldPa,
    tpDice,
    tpBonus,
    rs,
    iniBase: a.MU,
    weapon: shield ? `${weaponName} & ${shield.name}` : weaponName,
    attrs: a,
    ae: ch.ae ?? undefined,
    aeMax: ch.ae ?? undefined,
    spells,
    classId: ch.classId as DsaClassId,
  };
}

/** Parst einen TP-String wie "1W+4" oder "2W+2" in Würfel + Flat-Bonus. */
function parseTp(tp: string): { dice: number; bonus: number } {
  const m = /^\s*(\d+)\s*[wW]6?\s*(?:([+-])\s*(\d+))?\s*$/.exec(tp);
  if (!m) return { dice: 1, bonus: 0 };
  const dice = parseInt(m[1], 10);
  const sign = m[2] === "-" ? -1 : 1;
  const bonus = m[3] ? sign * parseInt(m[3], 10) : 0;
  return { dice, bonus };
}

export function foeCombatantFromStat(stat: EnemyStat, idx = 0): Combatant {
  return {
    id: `${stat.id}#${idx}`,
    name: stat.name,
    side: "foe",
    le: stat.le,
    leMax: stat.le,
    at: stat.at,
    pa: stat.pa,
    tpDice: stat.tpDice,
    tpBonus: stat.tpBonus,
    rs: stat.rs,
    iniBase: stat.iniBase,
    weapon: stat.weapon,
    intro: stat.intro,
  };
}

/**
 * Layards Gefährten am Spieltisch — Yelva (Elfe) und Brem (Streuner).
 * Sie kämpfen automatisch mit, sind aber etwas schwächer als der Held.
 */
export const COMPANION_STATS: ReadonlyArray<EnemyStat & { id: string }> = [
  {
    id: "yelva",
    name: "Yelva (Elfe)",
    le: 22,
    at: 11,
    pa: 10,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 13,
    weapon: "Elfenbogen",
  },
  {
    id: "brem",
    name: "Brem (Streuner)",
    le: 24,
    at: 11,
    pa: 10,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 12,
    weapon: "Dolch",
  },
];

export function companionCombatants(intent?: CombatIntent | null): Combatant[] {
  const i = intent ?? EMPTY_COMBAT_INTENT;
  return COMPANION_STATS.map((c) => {
    const own: CompanionIntent | undefined =
      c.id === "yelva" ? i.yelva : c.id === "brem" ? i.brem : undefined;
    const role: CombatantRole = own?.backline
      ? "backline"
      : own?.protect
        ? "support"
        : "frontline";
    let at = c.at;
    let pa = c.pa;
    let weapon = c.weapon;
    let rangedWeapon: string | undefined;
    if (own?.ranged) {
      // Fernkampf: leichte AT-Stärkung (geübter Schuss), keine Nahkampf-Parade.
      at = c.at + 1;
      pa = Math.max(1, c.pa - 1);
      rangedWeapon = c.id === "yelva" ? "Elfenbogen" : "Wurfdolch";
      weapon = rangedWeapon;
    }
    if (own?.protect) {
      pa += 2; // konzentriert sich aufs Parieren
    }
    if (own?.flank) {
      at += 1;
      pa = Math.max(1, pa - 1);
    }
    const base: Combatant = {
      id: c.id,
      name: c.name,
      side: "hero",
      le: c.le,
      leMax: c.le,
      at,
      pa,
      tpDice: c.tpDice,
      tpBonus: c.tpBonus,
      rs: c.rs,
      iniBase: c.iniBase,
      weapon,
      role,
      rangedWeapon,
    };
    // Yelva ist Auelfe — sie hat AsP und ein kleines Hauszauber-Repertoire.
    // Eigenschaften sind Standard-Elfenwerte und reichen für die drei
    // 3W20-Spruchproben (MU/IN/CH bzw. KL/IN/CH).
    if (c.id === "yelva") {
      base.classId = "elf";
      base.ae = 24;
      base.aeMax = 24;
      base.spells = { ...YELVA_DEFAULT_SPELLS };
      base.attrs = { MU: 12, KL: 13, IN: 14, CH: 14, FF: 13, GE: 13, KK: 10 };
    }
    return base;
  });
}

function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}
function d20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export type CombatEventKind =
  | "round-start"
  | "ini"
  | "command"
  | "attack-hit"
  | "attack-miss"
  | "parry-success"
  | "damage"
  | "downed"
  | "end-victory"
  | "end-defeat"
  | "spell-cast"
  | "spell-fail"
  | "spell-fizzle";

export interface CombatEvent {
  kind: CombatEventKind;
  text: string;
  /** Würfel, die diesen Schritt bestimmt haben — für die Anzeige unten. */
  dice?: { label: string; value: number; target?: number; success?: boolean }[];
  /** Aktuelle LE-Snapshots nach dem Event (für Balken-Animation). */
  snapshot: { id: string; le: number; ae?: number }[];
  /** Wer hat zuletzt zugeschlagen (für Welt-Animation). */
  actorId?: string;
  targetId?: string;
}

export interface CombatResult {
  victory: boolean;
  events: CombatEvent[];
  /** LE-Status des Spieler-Helden (Layards Charakter) am Ende. */
  heroLeFinal: number;
  /** LE-Status aller Helden am Ende (Held + Gefährten). */
  heroesFinal: { id: string; le: number }[];
  /**
   * Wer ist gefallen? Sobald irgendein Held (Layard, Yelva, Brem) auf 0 LE
   * geht, gilt der Kampf als verloren — auch wenn die anderen noch stünden.
   * Liste in Sterbe-Reihenfolge.
   */
  fallenHeroes: { id: string; name: string }[];
}

// ════════════════════════════════════════════════════════════════
// Neues interaktives Modell: Wunden, Taktiken, Fail-Forward.
// Wird vom LLM-Abenteuer (DsaLlmAdventureScene + DsaCombatInteractive)
// genutzt. Die ältere `resolveCombat`-API bleibt für die scripted
// `DsaAdventureScene` unverändert bestehen.
// ════════════════════════════════════════════════════════════════

export type Tactic =
  | "balanced"
  | "aggressive"
  | "defensive"
  | "cunning"
  | "flee"
  | "spell"
  | "magic-none"
  | "magic-low"
  | "magic-mid"
  | "magic-high";

/** Schwerpunkt bei Magie-Taktiken, wenn Layard Balsam Salabunde kennt. */
export type SpellFocus = "offense" | "healing" | "balanced";

export const TACTIC_LABELS: Record<Tactic, { title: string; blurb: string }> = {
  balanced: {
    title: "Ausgewogen",
    blurb: "Konzentrierter Standardkampf. Tjark erzählt sachlich, ohne Pathos.",
  },
  aggressive: {
    title: "Aggressiver Vorstoß",
    blurb: "Du gehst nach vorn. Tjark erzählt blutig, kurz, treibend — Klingen suchen Fleisch.",
  },
  defensive: {
    title: "Defensives Taktieren",
    blurb: "Du gibst dem Feind die Initiative. Tjark erzählt belagernd, zäh, abwartend — du hältst stand.",
  },
  cunning: {
    title: "Umgebung nutzen",
    blurb: "KL-Probe je Runde. Erfolg: Gegner −2 AT/PA. Misserfolg: keine Wirkung.",
  },
  flee: {
    title: "Flucht / Einschüchtern",
    blurb: "CH-Probe je Runde. Erfolg: Kampf abbrechen. Misserfolg: Gegner +1 AT.",
  },
  spell: {
    title: "Kampfzauber wirken",
    blurb: "3W20-Probe gegen Eigenschaften, AsP-Kosten. Layard greift in dieser Runde nicht in den Nahkampf ein.",
  },
  "magic-none": {
    title: "Kein Magie-Einsatz",
    blurb: "Stab & Klinge — Layard spart seine Astralenergie vollständig.",
  },
  "magic-low": {
    title: "Wenig Magie",
    blurb: "Vereinzelt ein Spruch, sonst Nahkampf. Astralenergie wird geschont.",
  },
  "magic-mid": {
    title: "Moderater Magie-Einsatz",
    blurb: "Etwa jede zweite Runde ein Spruch. Balance aus Klinge und Formel.",
  },
  "magic-high": {
    title: "Viel Magie",
    blurb: "Solange AsP reichen, dröhnt jede Runde ein Spruch. Hohe Wirkung, hoher Verbrauch.",
  },
};

export type ConsequenceKind = "capture" | "robbery" | "wound" | "timeloss";

export interface WoundedCombatant extends Combatant {
  /** 0..3 — ab 3 ist die Heldenfigur endgültig kampfunfähig.
   *  Gegner führen keine Wunden — sie fallen einfach bei LE ≤ 0. */
  wounds: number;
  /** Temporäre Effekte (z. B. geblendet) — laufen rundenweise aus. */
  atMod?: number;
  paMod?: number;
  effectRoundsLeft?: number;
  effectLabel?: string;
}

export interface CombatState {
  heroes: WoundedCombatant[];
  foes: WoundedCombatant[];
  round: number;
  phase: "ongoing" | "victory" | "defeat" | "aborted";
  consequenceKind: ConsequenceKind | null;
  fallenHeroes: { id: string; name: string }[];
  /** Letzte tatsächlich verwendete Taktik — beeinflusst die Konsequenz-Auswahl. */
  lastTactic: Tactic;
  /** Freie Spielerwünsche aus dem letzten Prompt vor dem Kampf. */
  intent?: CombatIntent | null;
  /** Freie Spielerwünsche für die nächste Runde, während der Kampf läuft. */
  roundIntent?: CombatIntent | null;
  /** Wurde die einmalige Yelva-Blendaktion bereits aufgelöst? */
  blindResolved?: boolean;
  /** Hat Layard seinen Wunsch-Zauber bereits einmal abgesetzt? */
  layardSpellResolved?: boolean;
  /** Hat Yelva ihren Wunsch-Zauber bereits einmal abgesetzt? */
  yelvaSpellResolved?: boolean;
}

export interface PlayerStats {
  KL: number;
  CH: number;
}

function wrap(c: Combatant): WoundedCombatant {
  return { ...c, wounds: 0 };
}

export function createCombatState(
  heroes: Combatant[],
  foes: Combatant[],
  intent?: CombatIntent | null,
): CombatState {
  return {
    heroes: heroes.map(wrap),
    foes: foes.map(wrap),
    round: 0,
    phase: "ongoing",
    consequenceKind: null,
    fallenHeroes: [],
    lastTactic: "balanced",
    intent: intent ?? null,
    roundIntent: null,
    blindResolved: false,
    layardSpellResolved: false,
    yelvaSpellResolved: false,
  };
}

function applyRoundCompanionIntent(state: CombatState, intent: CombatIntent): void {
  const apply = (id: "yelva" | "brem", own: CompanionIntent) => {
    const c = state.heroes.find((h) => h.id === id);
    if (!c || !alive(c)) return;
    if (own.backline || own.ranged) c.role = "backline";
    if (own.protect) {
      c.role = "support";
      c.paMod = Math.max(c.paMod ?? 0, 2);
      c.effectRoundsLeft = Math.max(c.effectRoundsLeft ?? 0, 2);
      c.effectLabel = "deckt die Gruppe";
    }
    if (own.flank) {
      c.role = "frontline";
      c.atMod = Math.max(c.atMod ?? 0, 1);
      c.paMod = Math.min(c.paMod ?? 0, -1);
      c.effectRoundsLeft = Math.max(c.effectRoundsLeft ?? 0, 2);
      c.effectLabel = "flankiert";
    }
    if (own.ranged) {
      c.rangedWeapon = id === "yelva" ? "Elfenbogen" : "Wurfdolch";
      c.weapon = c.rangedWeapon;
    }
  };
  apply("yelva", intent.yelva);
  apply("brem", intent.brem);
}

function snapshotW(all: WoundedCombatant[]): { id: string; le: number }[] {
  return all.map((c) =>
    c.ae !== undefined ? { id: c.id, le: c.le, ae: c.ae } : { id: c.id, le: c.le },
  );
}

interface RoundModifiers {
  heroAt: number;
  heroPa: number;
  heroTp: number;
  foeAt: number;
  foePa: number;
}

function pickConsequence(tactic: Tactic): ConsequenceKind {
  const table: Record<Tactic, ConsequenceKind[]> = {
    aggressive: ["capture", "capture", "wound", "wound", "robbery"],
    defensive: ["robbery", "robbery", "robbery", "timeloss", "timeloss", "wound"],
    cunning: ["timeloss", "timeloss", "capture", "capture", "wound"],
    flee: ["robbery", "robbery", "capture", "capture"],
    balanced: ["capture", "robbery", "wound", "timeloss"],
    spell: ["capture", "wound", "robbery", "timeloss"],
    "magic-none": ["capture", "robbery", "wound", "timeloss"],
    "magic-low": ["capture", "robbery", "wound", "timeloss"],
    "magic-mid": ["capture", "wound", "robbery", "timeloss"],
    "magic-high": ["capture", "wound", "wound", "robbery", "timeloss"],
  };
  const arr = table[tactic];
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Führt genau eine Runde aus und gibt die Events dieser Runde zurück.
 * Mutiert `state` (LE, Wunden, Phase). Wenn `state.phase !== "ongoing"`
 * vorher schon terminal war, liefert die Funktion eine leere Liste.
 */
export function resolveRound(
  state: CombatState,
  tactic: Tactic,
  player: PlayerStats,
  opts?: { spellFocus?: SpellFocus; intent?: CombatIntent | null },
): CombatEvent[] {
  if (state.phase !== "ongoing") return [];
  state.lastTactic = tactic;
  state.round += 1;
  const roundIntent = state.roundIntent ?? null;
  const intent = mergeCombatIntents(opts?.intent ?? state.intent ?? null, roundIntent);
  state.roundIntent = null;
  const events: CombatEvent[] = [];
  const all = [...state.heroes, ...state.foes];

  const mods: RoundModifiers = { heroAt: 0, heroPa: 0, heroTp: 0, foeAt: 0, foePa: 0 };

  // Abklingende Effekte (z. B. Geblendet) rundenweise reduzieren.
  for (const c of [...state.foes, ...state.heroes]) {
    if ((c.effectRoundsLeft ?? 0) > 0) {
      c.effectRoundsLeft = (c.effectRoundsLeft ?? 0) - 1;
      if ((c.effectRoundsLeft ?? 0) <= 0) {
        c.atMod = 0;
        c.paMod = 0;
        c.effectLabel = undefined;
        c.effectRoundsLeft = 0;
      }
    }
  }

  // Runden-Header
  events.push({
    kind: "round-start",
    text: `── Runde ${state.round} · ${TACTIC_LABELS[tactic].title} ──`,
    snapshot: snapshotW(all),
  });

  if (roundIntent?.notes.length) {
    applyRoundCompanionIntent(state, roundIntent);
    events.push({
      kind: "command",
      text: `Kampfbefehl: ${roundIntent.notes.join(" · ")}`,
      snapshot: snapshotW(all),
    });
  }

  // ── Yelvas Blend-/Ablenkungs-Aktion (einmalig pro Kampf) ───────
  if (intent?.yelva.blind && !state.blindResolved) {
    const yelva = state.heroes.find((h) => h.id === "yelva");
    const foeTarget = pickFoeTargetW(state.foes);
    if (yelva && alive(yelva) && foeTarget) {
      const roll = d20();
      // Stellvertretende CH-Probe (Yelva = elfengewandt, Default 13).
      const target = 13;
      const success = roll <= target && roll !== 20;
      state.blindResolved = true;
      if (success) {
        foeTarget.atMod = -3;
        foeTarget.paMod = -2;
        foeTarget.effectRoundsLeft = 2;
        foeTarget.effectLabel = "geblendet";
        events.push({
          kind: "ini",
          text: `Yelva wirft Staub und Lichtfunken in das Gesicht von ${foeTarget.name} — geblendet! (AT −3, PA −2 für 2 Runden)`,
          dice: [{ label: "Yelva CH", value: roll, target, success: true }],
          snapshot: snapshotW(all),
          actorId: yelva.id,
          targetId: foeTarget.id,
        });
      } else {
        events.push({
          kind: "ini",
          text: `Yelva versucht ${foeTarget.name} zu blenden — daneben.`,
          dice: [{ label: "Yelva CH", value: roll, target, success: false }],
          snapshot: snapshotW(all),
          actorId: yelva.id,
          targetId: foeTarget.id,
        });
      }
    }
  }

  // Taktik-spezifische Eröffnungs-Probe.
  // balanced / aggressive / defensive sind rein narrativ — gleiche Werte,
  // unterschiedlicher Erzählton (siehe Tjark-Master-Prompt). Cunning und
  // Flucht bleiben mechanisch, weil sie als Sonder-Aktion eine Probe
  // auslösen und einen echten Effekt bzw. Kampfabbruch ermöglichen.
  if (tactic === "cunning") {
    const roll = d20();
    const success = roll <= player.KL && roll !== 20;
    events.push({
      kind: "ini",
      text: success
        ? `Listige Aktion gelingt — Sand, Stuhl, herabfallender Krug. Gegner −2 AT/PA diese Runde.`
        : `Listige Aktion misslingt — kein Effekt.`,
      dice: [{ label: "KL-Probe", value: roll, target: player.KL, success }],
      snapshot: snapshotW(all),
    });
    if (success) { mods.foeAt -= 2; mods.foePa -= 2; }
  } else if (tactic === "flee") {
    const roll = d20();
    const success = roll <= player.CH && roll !== 20;
    events.push({
      kind: "ini",
      text: success
        ? `Einschüchtern / Flucht gelingt — der Kampf bricht ab.`
        : `Einschüchtern misslingt — Gegner wittern Schwäche. +1 AT diese Runde.`,
      dice: [{ label: "CH-Probe", value: roll, target: player.CH, success }],
      snapshot: snapshotW(all),
    });
    if (success) {
      state.phase = "aborted";
      return events;
    }
    mods.foeAt += 1;
  }

  // Layard wirkt einen Kampfzauber — die Aktion ersetzt seinen Nahkampfangriff
  // in dieser Runde, läuft aber VOR der Initiative ab (Zauber sind schnell,
  // und so kann sich das Schadensfenster vor den Gegner-Aktionen öffnen).
  let layardSkipMelee = false;

  // ── Expliziter Spielerwunsch: Layard wirkt diesen Spruch ─────────
  const manualSpellThisRound = !!roundIntent?.layardSpellId;
  if (intent?.layardSpellId && (!state.layardSpellResolved || manualSpellThisRound)) {
    const layard = state.heroes.find((h) => h.id === "hero");
    if (layard && alive(layard)) {
      const spell = SPELLS.find((s) => s.id === intent.layardSpellId);
      const zfw = spell ? layard.spells?.[spell.id] : undefined;
      if (spell && typeof zfw === "number" && (layard.ae ?? 0) >= spellCost(spell)) {
        if (!manualSpellThisRound) state.layardSpellResolved = true;
        layardSkipMelee = true;
        if (spell.id === "balsam_salabunde") {
          resolveLayardBalsam(layard, all, events);
        } else {
          const foeTarget = pickWeakestW(state.foes);
          if (foeTarget) {
            resolveLayardSpellExplicit(layard, foeTarget, spell, zfw, all, events);
          }
        }
      } else if (spell) {
        // Bekannter Spruch, aber nicht bezahlbar / kein Ziel: einmaliger
        // Hinweis, dann ausschalten (kein Endlos-Spam).
        if (!manualSpellThisRound) state.layardSpellResolved = true;
        const reason = typeof zfw !== "number"
          ? `Layard kennt ${spell.name} nicht.`
          : `Layard hat nicht genug Astralenergie für ${spell.name}.`;
        events.push({
          kind: "spell-fizzle",
          text: reason,
          snapshot: snapshotW(all),
          actorId: layard.id,
        });
      }
    }
  }

  if (tactic === "spell") {
    layardSkipMelee = true;
    const layard = state.heroes.find((h) => h.id === "hero");
    const foeTarget = layard ? pickWeakestW(state.foes) : null;
    if (layard && alive(layard) && foeTarget) {
      resolveLayardSpell(layard, foeTarget, all, events);
    }
  }

  // Magie-Intensitäts-Taktiken: Layard entscheidet pro Runde probabilistisch,
  // ob er einen Spruch wirkt. Schwerpunkt steuert offensiv vs. heilend (nur
  // wenn Balsam Salabunde bekannt ist).
  if (
    tactic === "magic-none" ||
    tactic === "magic-low" ||
    tactic === "magic-mid" ||
    tactic === "magic-high"
  ) {
    const prob: Record<typeof tactic, number> = {
      "magic-none": 0,
      "magic-low": 0.34,
      "magic-mid": 0.67,
      "magic-high": 1,
    } as const;
    const p = prob[tactic];
    const layard = state.heroes.find((h) => h.id === "hero");
    if (p > 0 && layard && alive(layard) && Math.random() < p) {
      const focus: SpellFocus = opts?.spellFocus ?? "offense";
      const knowsBalsam =
        typeof layard.spells?.["balsam_salabunde"] === "number";
      const missingLe = Math.max(0, layard.leMax - layard.le);
      const halfLe = Math.ceil(layard.leMax * 0.5);
      const wantHeal =
        knowsBalsam &&
        missingLe >= 3 &&
        (focus === "healing" ||
          (focus === "balanced" && layard.le <= halfLe));
      if (wantHeal) {
        layardSkipMelee = true;
        resolveLayardBalsam(layard, all, events);
      } else if (focus !== "healing") {
        const foeTarget = pickWeakestW(state.foes);
        if (foeTarget && pickCombatSpell(layard)) {
          layardSkipMelee = true;
          resolveLayardSpell(layard, foeTarget, all, events);
        }
      }
      // Heilfokus ohne Bedarf → kein Spruch, normaler Nahkampf bleibt.
    }
  }

  // Initiative
  const order = [...state.heroes.filter(alive), ...state.foes.filter(alive)]
    .map((c) => ({ c, ini: c.iniBase + d6() }))
    .sort((a, b) => b.ini - a.ini);
  events.push({
    kind: "ini",
    text: "Initiative: " + order.map((o) => `${o.c.name} ${o.ini}`).join(" · "),
    dice: order.map((o) => ({ label: `${o.c.name.split(" ")[0]} INI`, value: o.ini })),
    snapshot: snapshotW(all),
  });

  const isLayard = (c: WoundedCombatant) => c.id === "hero";

  for (const { c: actor } of order) {
    if (!alive(actor)) continue;
    if (state.phase !== "ongoing") break;
    if (state.foes.every((f) => !alive(f))) break;
    // Layard hat diese Runde gezaubert → kein Nahkampf-Angriff.
    if (layardSkipMelee && isLayard(actor)) continue;

    const target =
      actor.side === "hero" ? pickFoeTargetW(state.foes) : pickHeroTargetW(state.heroes);
    if (!target) continue;

    // Wunden-Malus auf AT/PA: −2 pro Wunde des Akteurs/Verteidigers.
    const actorAtMod =
      -2 * actor.wounds +
      (actor.atMod ?? 0) +
      (actor.side === "foe" ? mods.foeAt : isLayard(actor) ? mods.heroAt : 0);
    const targetPaMod =
      -2 * target.wounds +
      (target.paMod ?? 0) +
      (target.side === "foe" ? mods.foePa : isLayard(target) ? mods.heroPa : 0);
    const actorTpMod =
      -2 * actor.wounds + (isLayard(actor) ? mods.heroTp : 0);

    const effAt = Math.max(1, actor.at + actorAtMod);
    const effPa = Math.max(1, target.pa + targetPaMod);

    // Attacke
    const atRoll = d20();
    const atHit = atRoll <= effAt && atRoll !== 20;
    if (!atHit) {
      events.push({
        kind: "attack-miss",
        text: `${actor.name} greift mit ${actor.weapon} an — daneben.`,
        dice: [{ label: "AT (1W20)", value: atRoll, target: effAt, success: false }],
        snapshot: snapshotW(all),
        actorId: actor.id,
        targetId: target.id,
      });
      continue;
    }
    events.push({
      kind: "attack-hit",
      text: `${actor.name} trifft auf ${target.name} mit ${actor.weapon}.`,
      dice: [{ label: "AT (1W20)", value: atRoll, target: effAt, success: true }],
      snapshot: snapshotW(all),
      actorId: actor.id,
      targetId: target.id,
    });

    // Parade
    const paRoll = d20();
    const paHit = paRoll <= effPa && paRoll !== 20;
    if (paHit) {
      events.push({
        kind: "parry-success",
        text: `${target.name} pariert.`,
        dice: [{ label: "PA (1W20)", value: paRoll, target: effPa, success: true }],
        snapshot: snapshotW(all),
        actorId: target.id,
        targetId: actor.id,
      });
      continue;
    }

    // Schaden
    const tpRolls: number[] = [];
    let raw = actor.tpBonus + actorTpMod;
    for (let i = 0; i < actor.tpDice; i++) {
      const r = d6();
      tpRolls.push(r);
      raw += r;
    }
    const dmg = Math.max(1, raw - target.rs);
    target.le = Math.max(0, target.le - dmg);

    events.push({
      kind: "damage",
      text: `${dmg} TP Schaden (${tpRolls.join("+")}${
        actor.tpBonus ? `+${actor.tpBonus}` : ""
      } − RS ${target.rs}). ${target.name}: ${target.le}/${target.leMax} LE.`,
      dice: [
        ...tpRolls.map((r, i) => ({ label: `TP W${i + 1}`, value: r })),
        { label: "RS", value: target.rs },
      ],
      snapshot: snapshotW(all),
      actorId: actor.id,
      targetId: target.id,
    });

    if (target.le <= 0) {
      if (target.side === "hero") {
        target.wounds += 1;
        if (target.wounds >= 3) {
          state.fallenHeroes.push({ id: target.id, name: target.name });
          events.push({
            kind: "downed",
            text: `${target.name} sinkt zu Boden — dritte Wunde, kampfunfähig.`,
            snapshot: snapshotW(all),
            actorId: actor.id,
            targetId: target.id,
          });
        } else {
          target.le = Math.max(1, Math.floor(target.leMax / 2));
          events.push({
            kind: "downed",
            text: `${target.name} stürzt, rappelt sich blutend wieder auf — ${target.wounds}. Wunde brennt. (LE ${target.le}/${target.leMax})`,
            snapshot: snapshotW(all),
            actorId: actor.id,
            targetId: target.id,
          });
        }
      } else {
        events.push({
          kind: "downed",
          text: `${target.name} ist kampfunfähig.`,
          snapshot: snapshotW(all),
          actorId: actor.id,
          targetId: target.id,
        });
      }
    }
  }

  // Ende-Check
  const heroAlive = state.heroes.some(
    (h) => !state.fallenHeroes.some((f) => f.id === h.id),
  );
  const layardDown = state.fallenHeroes.some((f) => f.id === "hero");
  if (state.foes.every((f) => !alive(f))) {
    state.phase = "victory";
    events.push({
      kind: "end-victory",
      text: "Der Kampf ist vorbei. Ihr habt überlebt.",
      snapshot: snapshotW(all),
    });
  } else if (layardDown || !heroAlive) {
    state.phase = "defeat";
    state.consequenceKind = pickConsequence(tactic);
    const desc: Record<ConsequenceKind, string> = {
      capture: "Schwärze. Du erwachst gefesselt — Ausrüstung weg.",
      robbery: "Sie lassen dich blutend im Schlamm liegen. Beraubt.",
      wound: "Du überlebst, behältst aber eine bleibende Narbe.",
      timeloss: "Drei Tage Fieberkoma — die Welt hat sich verändert.",
    };
    events.push({
      kind: "end-defeat",
      text: `Niederlage. ${desc[state.consequenceKind]}`,
      snapshot: snapshotW(all),
    });
  }

  return events;
}

function pickWeakestW(group: WoundedCombatant[]): WoundedCombatant | null {
  const live = group.filter(alive);
  if (live.length === 0) return null;
  return live.sort((a, b) => a.le - b.le)[0];
}
function pickFoeTargetW(foes: WoundedCombatant[]): WoundedCombatant | null {
  const live = foes.filter(alive);
  if (live.length === 0) return null;
  return live.sort((a, b) => a.le - b.le)[0];
}

/**
 * Rollenbewusste Zielwahl der Gegner: Frontlinie wird stark bevorzugt;
 * Backline/Support nur, wenn keine Frontkämpfer mehr stehen.
 */
function pickHeroTargetW(heroes: WoundedCombatant[]): WoundedCombatant | null {
  const live = heroes.filter(alive);
  if (live.length === 0) return null;
  const front = live.filter((h) => (h.role ?? "frontline") === "frontline");
  const support = live.filter((h) => h.role === "support");
  const pool = front.length > 0 ? front : support.length > 0 ? support : live;
  return pool.sort((a, b) => a.le - b.le)[0];
}

/**
 * Variante von resolveLayardSpell, die einen vom Spieler ausdrücklich
 * gewünschten Spruch verarbeitet (statt nach Priorität zu wählen).
 */
function resolveLayardSpellExplicit(
  layard: WoundedCombatant,
  foe: WoundedCombatant,
  spell: SpellDef,
  zfw: number,
  all: WoundedCombatant[],
  events: CombatEvent[],
): void {
  const cost = spellCost(spell);
  const attrs = layard.attrs;
  if (!attrs) {
    events.push({
      kind: "spell-fizzle",
      text: `${layard.name} kann ${spell.name} ohne Eigenschaftswerte nicht stabilisieren.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }
  const ownSchool = spellOwnSchool(layard.classId, spell);
  const modBuf = ownSchool ? 3 : 0;
  const rolls: number[] = [d20(), d20(), d20()];
  let bufferLeft = zfw + modBuf;
  const dice = rolls.map((r, i) => {
    const attrId = spell.probe[i] as AttributeId;
    const target = attrs[attrId] ?? 10;
    const fail = r > target;
    if (fail) bufferLeft -= r - target;
    return { label: `${attrId} (W20)`, value: r, target, success: !fail };
  });
  const ones = rolls.filter((r) => r === 1).length;
  const twenties = rolls.filter((r) => r === 20).length;
  let success: boolean;
  if (twenties >= 2) success = false;
  else if (ones >= 2) success = true;
  else success = bufferLeft >= 0;
  const aeCost = success ? cost : Math.ceil(cost / 2);
  layard.ae = Math.max(0, (layard.ae ?? 0) - aeCost);
  if (!success) {
    events.push({
      kind: "spell-fail",
      text: `${layard.name} wirkt ${spell.name} (Wunsch) — Probe misslingt. AsP −${aeCost} → ${layard.ae}.`,
      dice,
      snapshot: snapshotW(all),
      actorId: layard.id,
      targetId: foe.id,
    });
    return;
  }
  const { rolls: tpRolls, dmg, rsApplied } = spellDamage(spell, zfw, foe.rs);
  foe.le = Math.max(0, foe.le - dmg);
  events.push({
    kind: "spell-cast",
    text: `${layard.name} wirkt ${spell.name}${ownSchool ? " (Hauszauber)" : ""} auf ${foe.name}. ${dmg} TP (RS ${rsApplied}). AsP −${aeCost} → ${layard.ae}. ${foe.name}: ${foe.le}/${foe.leMax} LE.`,
    dice: [
      ...dice,
      ...tpRolls.map((r, i) => ({ label: `TP W${i + 1}`, value: r })),
    ],
    snapshot: snapshotW(all),
    actorId: layard.id,
    targetId: foe.id,
  });
  if (foe.le <= 0) {
    events.push({
      kind: "downed",
      text: `${foe.name} ist kampfunfähig.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
      targetId: foe.id,
    });
  }
}

// ────────────────────────────────────────────────────────────────
// Kampfzauber für Layard (Tactic "spell").
// ────────────────────────────────────────────────────────────────

/** Reihenfolge, in der Layard Zauber bevorzugt — stärkster zuerst. */
const COMBAT_SPELL_PRIORITY = ["ignifaxius", "blitz_dich_find", "fulminictus"];

/** Hauszauber-Schulen für die −3-Erleichterung. */
function spellOwnSchool(classId: string | undefined, spell: SpellDef): boolean {
  if (!classId) return false;
  return spell.schools.includes(classId);
}

/** AsP-Kosten als Zahl (Strings wie "KK/2" werden defensiv auf 4 gesetzt). */
function spellCost(spell: SpellDef): number {
  const n = Number(spell.cost);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

/** Wählt den ersten priorisierten Zauber, den Layard kennt UND bezahlen kann. */
function pickCombatSpell(
  layard: WoundedCombatant,
): { spell: SpellDef; zfw: number; cost: number } | null {
  const known = layard.spells;
  const ae = layard.ae ?? 0;
  if (!known) return null;
  for (const id of COMBAT_SPELL_PRIORITY) {
    const zfw = known[id];
    if (typeof zfw !== "number" || zfw < 0) continue;
    const spell = SPELLS.find((s) => s.id === id);
    if (!spell) continue;
    const cost = spellCost(spell);
    if (ae < cost) continue;
    return { spell, zfw, cost };
  }
  return null;
}

/** TP-Formel je Zauber. RS-Anteil halbiert sich bei Blitz dich find. */
function spellDamage(
  spell: SpellDef,
  zfw: number,
  targetRs: number,
): { rolls: number[]; dmg: number; rsApplied: number } {
  const rolls: number[] = [];
  let raw = zfw;
  let dice = 1;
  let rsApplied = targetRs;
  if (spell.id === "ignifaxius") {
    dice = 2; // 2W6 + ZfW
  } else if (spell.id === "blitz_dich_find") {
    dice = 1; // 1W6 + ZfW
    rsApplied = Math.floor(targetRs / 2);
  } else if (spell.id === "fulminictus") {
    dice = 1; // 1W6 + ZfW/2
    raw = Math.floor(zfw / 2);
  }
  for (let i = 0; i < dice; i++) {
    const r = d6();
    rolls.push(r);
    raw += r;
  }
  const dmg = Math.max(1, raw - rsApplied);
  return { rolls, dmg, rsApplied };
}

/**
 * Führt Layards Zauber aus: Probe → AsP abziehen → Wirkung. Mutiert
 * `layard.ae` und ggf. `foe.le`. Schreibt 1–2 Events ins Log.
 */
function resolveLayardSpell(
  layard: WoundedCombatant,
  foe: WoundedCombatant,
  all: WoundedCombatant[],
  events: CombatEvent[],
): void {
  // 1. Hat Layard überhaupt einen wirkbaren Kampfzauber?
  const pick = pickCombatSpell(layard);
  if (!pick) {
    const reason = !layard.spells || Object.keys(layard.spells).length === 0
      ? `${layard.name} kennt keinen Kampfzauber — die Formel verpufft, bevor sie beginnt.`
      : `${layard.name} hat zu wenig Astralenergie für einen Kampfzauber — die Formel zerbricht.`;
    events.push({
      kind: "spell-fizzle",
      text: reason,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }
  const { spell, zfw, cost } = pick;
  const attrs = layard.attrs;
  if (!attrs) {
    events.push({
      kind: "spell-fizzle",
      text: `${layard.name} kann den Zauber ${spell.name} ohne Eigenschaftswerte nicht stabilisieren.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }

  // 2. 3W20-Probe gegen die drei Zauber-Eigenschaften.
  const ownSchool = spellOwnSchool(layard.classId, spell);
  const modBuf = ownSchool ? 3 : 0; // Hauszauber: +3 ZfW-Puffer
  const rolls: number[] = [d20(), d20(), d20()];
  let bufferLeft = zfw + modBuf;
  const dice = rolls.map((r, i) => {
    const attrId = spell.probe[i] as AttributeId;
    const target = attrs[attrId] ?? 10;
    const fail = r > target;
    if (fail) bufferLeft -= r - target;
    return { label: `${attrId} (W20)`, value: r, target, success: !fail };
  });
  const ones = rolls.filter((r) => r === 1).length;
  const twenties = rolls.filter((r) => r === 20).length;
  let success: boolean;
  if (twenties >= 2) success = false;
  else if (ones >= 2) success = true;
  else success = bufferLeft >= 0;

  // 3. AsP abziehen (Erfolg: voll, Misserfolg: halb).
  const aeCost = success ? cost : Math.ceil(cost / 2);
  layard.ae = Math.max(0, (layard.ae ?? 0) - aeCost);

  if (!success) {
    events.push({
      kind: "spell-fail",
      text: `${layard.name} wirkt ${spell.name} — Probe misslingt (Puffer ${bufferLeft}). Astralenergie verpufft halbiert (AsP −${aeCost} → ${layard.ae}).`,
      dice,
      snapshot: snapshotW(all),
      actorId: layard.id,
      targetId: foe.id,
    });
    return;
  }

  // 4. Erfolg → Schaden anwenden.
  const { rolls: tpRolls, dmg, rsApplied } = spellDamage(spell, zfw, foe.rs);
  foe.le = Math.max(0, foe.le - dmg);

  const formulaStr =
    spell.id === "ignifaxius"
      ? `2W6+ZfW(${zfw})`
      : spell.id === "fulminictus"
        ? `1W6+ZfW/2(${Math.floor(zfw / 2)})`
        : `1W6+ZfW(${zfw})`;
  events.push({
    kind: "spell-cast",
    text: `${layard.name} wirkt ${spell.name}${ownSchool ? " (Hauszauber)" : ""} auf ${foe.name}. ${dmg} TP (${tpRolls.join("+")} ${formulaStr} − RS ${rsApplied}). AsP −${aeCost} → ${layard.ae}. ${foe.name}: ${foe.le}/${foe.leMax} LE.`,
    dice: [
      ...dice,
      ...tpRolls.map((r, i) => ({ label: `TP W${i + 1}`, value: r })),
    ],
    snapshot: snapshotW(all),
    actorId: layard.id,
    targetId: foe.id,
  });

  if (foe.le <= 0) {
    events.push({
      kind: "downed",
      text: `${foe.name} ist kampfunfähig.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
      targetId: foe.id,
    });
  }
}

/**
 * Layard wirkt Balsam Salabunde auf sich selbst. AsP-Kosten = geheilte LE
 * (1 AsP pro LE). Bei misslungener Probe verpuffen die halben Kosten der
 * geplanten Heilung. Mutiert `layard.le` und `layard.ae`.
 */
function resolveLayardBalsam(
  layard: WoundedCombatant,
  all: WoundedCombatant[],
  events: CombatEvent[],
): void {
  const spell = SPELLS.find((s) => s.id === "balsam_salabunde");
  const zfw = layard.spells?.["balsam_salabunde"];
  const attrs = layard.attrs;
  if (!spell || typeof zfw !== "number" || !attrs) {
    events.push({
      kind: "spell-fizzle",
      text: `${layard.name} kann Balsam Salabunde nicht stabilisieren.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }
  const ae = layard.ae ?? 0;
  const missingLe = Math.max(0, layard.leMax - layard.le);
  // Geplante Heilung: durch ZfW gedeckelt, durch AsP gedeckelt, durch Bedarf.
  const planned = Math.max(1, Math.min(missingLe, zfw, ae));
  if (ae <= 0 || missingLe <= 0) {
    events.push({
      kind: "spell-fizzle",
      text: `${layard.name} braucht keine Heilung — Balsam Salabunde bleibt ungewirkt.`,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }

  const ownSchool = spellOwnSchool(layard.classId, spell);
  const modBuf = ownSchool ? 3 : 0;
  const rolls: number[] = [d20(), d20(), d20()];
  let bufferLeft = zfw + modBuf;
  const dice = rolls.map((r, i) => {
    const attrId = spell.probe[i] as AttributeId;
    const target = attrs[attrId] ?? 10;
    const fail = r > target;
    if (fail) bufferLeft -= r - target;
    return { label: `${attrId} (W20)`, value: r, target, success: !fail };
  });
  const ones = rolls.filter((r) => r === 1).length;
  const twenties = rolls.filter((r) => r === 20).length;
  let success: boolean;
  if (twenties >= 2) success = false;
  else if (ones >= 2) success = true;
  else success = bufferLeft >= 0;

  if (!success) {
    const lost = Math.max(1, Math.ceil(planned / 2));
    layard.ae = Math.max(0, ae - lost);
    events.push({
      kind: "spell-fail",
      text: `${layard.name} wirkt Balsam Salabunde — Probe misslingt (Puffer ${bufferLeft}). Astralenergie verpufft halbiert (AsP −${lost} → ${layard.ae}).`,
      dice,
      snapshot: snapshotW(all),
      actorId: layard.id,
    });
    return;
  }

  // Erfolg: Heilung in Höhe von `planned`, gleich viele AsP abziehen.
  layard.le = Math.min(layard.leMax, layard.le + planned);
  layard.ae = Math.max(0, ae - planned);
  events.push({
    kind: "spell-cast",
    text: `${layard.name} wirkt Balsam Salabunde${ownSchool ? " (Hauszauber)" : ""} auf sich selbst. +${planned} LE (AsP −${planned} → ${layard.ae}). ${layard.name}: ${layard.le}/${layard.leMax} LE.`,
    dice,
    snapshot: snapshotW(all),
    actorId: layard.id,
    targetId: layard.id,
  });
}

function snapshot(all: Combatant[]): { id: string; le: number }[] {
  return all.map((c) => ({ id: c.id, le: c.le }));
}

function alive(c: Combatant): boolean {
  return c.le > 0;
}

function pickWeakest(group: Combatant[]): Combatant | null {
  const live = group.filter(alive);
  if (live.length === 0) return null;
  return live.sort((a, b) => a.le - b.le)[0];
}

function pickFoeTarget(foes: Combatant[]): Combatant | null {
  const live = foes.filter(alive);
  if (live.length === 0) return null;
  // Schwächsten zuerst — taktisch sinnvoll.
  return live.sort((a, b) => a.le - b.le)[0];
}

/**
 * Führt einen kompletten Kampf durch und gibt die Event-Liste zurück.
 * Die Anzeige spielt die Events dann zeitversetzt ab.
 */
export function resolveCombat(
  heroes: Combatant[],
  foes: Combatant[],
  opts: { maxRounds?: number } = {},
): CombatResult {
  const maxRounds = opts.maxRounds ?? 20;
  const hero = heroes[0];
  const all: Combatant[] = [...heroes, ...foes];
  const events: CombatEvent[] = [];

  // Intro-Events für Gegner mit Flavor.
  for (const f of foes) {
    if (f.intro) {
      events.push({
        kind: "round-start",
        text: `${f.name} tritt vor: „${f.intro}"`,
        snapshot: snapshot(all),
        actorId: f.id,
      });
    }
  }

  // Niederlagebedingung: Sobald *irgendein* Held fällt, ist der Kampf vorbei.
  // Das spiegelt die Spieltisch-Stimmung wider („zu zweit macht es keinen
  // Spaß"). Wir merken uns die Reihenfolge der Toten, damit der Dialog
  // weiß, wer gefallen ist.
  const fallenHeroes: { id: string; name: string }[] = [];
  const markIfFallen = (c: Combatant) => {
    if (c.side !== "hero") return;
    if (c.le > 0) return;
    if (fallenHeroes.some((f) => f.id === c.id)) return;
    fallenHeroes.push({ id: c.id, name: c.name });
  };
  const anyHeroDown = () => fallenHeroes.length > 0;

  for (let round = 1; round <= maxRounds; round++) {
    if (anyHeroDown()) break;
    if (foes.every((f) => !alive(f))) break;

    // Initiative pro Runde — höchste zuerst.
    const order = [...heroes.filter(alive), ...foes.filter(alive)]
      .map((c) => ({ c, ini: c.iniBase + d6() }))
      .sort((a, b) => b.ini - a.ini);

    events.push({
      kind: "round-start",
      text: `── Runde ${round} ──`,
      snapshot: snapshot(all),
    });
    events.push({
      kind: "ini",
      text:
        "Initiative: " +
        order.map((o) => `${o.c.name} ${o.ini}`).join(" · "),
      dice: order.map((o) => ({
        label: `${o.c.name.split(" ")[0]} INI`,
        value: o.ini,
      })),
      snapshot: snapshot(all),
    });

    for (const { c: actor } of order) {
      if (!alive(actor)) continue;
      if (anyHeroDown()) break;
      if (foes.every((f) => !alive(f))) break;

      const target =
        actor.side === "hero"
          ? pickFoeTarget(foes)
          : pickWeakest(heroes);
      if (!target) continue;

      // Attacke
      const atRoll = d20();
      const atHit = atRoll <= actor.at && atRoll !== 20;
      if (!atHit) {
        events.push({
          kind: "attack-miss",
          text: `${actor.name} greift mit ${actor.weapon} an — daneben.`,
          dice: [{ label: "AT (1W20)", value: atRoll, target: actor.at, success: false }],
          snapshot: snapshot(all),
          actorId: actor.id,
          targetId: target.id,
        });
        continue;
      }

      events.push({
        kind: "attack-hit",
        text: `${actor.name} trifft auf ${target.name} mit ${actor.weapon}.`,
        dice: [{ label: "AT (1W20)", value: atRoll, target: actor.at, success: true }],
        snapshot: snapshot(all),
        actorId: actor.id,
        targetId: target.id,
      });

      // Parade
      const paRoll = d20();
      const paHit = paRoll <= target.pa && paRoll !== 20;
      if (paHit) {
        events.push({
          kind: "parry-success",
          text: `${target.name} pariert.`,
          dice: [{ label: "PA (1W20)", value: paRoll, target: target.pa, success: true }],
          snapshot: snapshot(all),
          actorId: target.id,
          targetId: actor.id,
        });
        continue;
      }

      // Schaden
      const tpRolls: number[] = [];
      let raw = actor.tpBonus;
      for (let i = 0; i < actor.tpDice; i++) {
        const r = d6();
        tpRolls.push(r);
        raw += r;
      }
      const dmg = Math.max(1, raw - target.rs);
      target.le = Math.max(0, target.le - dmg);

      events.push({
        kind: "damage",
        text: `${dmg} TP Schaden (${tpRolls.join("+")}${
          actor.tpBonus ? `+${actor.tpBonus}` : ""
        } − RS ${target.rs}). ${target.name}: ${target.le}/${target.leMax} LE.`,
        dice: [
          ...tpRolls.map((r, i) => ({
            label: `TP W${i + 1}`,
            value: r,
          })),
          { label: "RS", value: target.rs },
        ],
        snapshot: snapshot(all),
        actorId: actor.id,
        targetId: target.id,
      });

      if (!alive(target)) {
        markIfFallen(target);
        events.push({
          kind: "downed",
          text:
            target.side === "hero"
              ? `${target.name} sinkt zu Boden.`
              : `${target.name} ist kampfunfähig.`,
          snapshot: snapshot(all),
          actorId: actor.id,
          targetId: target.id,
        });
      }
    }
  }

  const victory = !anyHeroDown() && foes.every((f) => !alive(f));
  events.push({
    kind: victory ? "end-victory" : "end-defeat",
    text: victory
      ? "Der Kampf ist vorbei. Ihr habt überlebt."
      : "Der Kampf ist verloren. Stille legt sich über die Lichtung.",
    snapshot: snapshot(all),
  });

  return {
    victory,
    events,
    heroLeFinal: hero.le,
    heroesFinal: heroes.map((h) => ({ id: h.id, le: h.le })),
    fallenHeroes,
  };
}
