import type { Attrs } from "./dice";
import type { DsaClassId } from "./classes";
import type { DsaCharacterSummary } from "@/game/types";

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
    le: 28,
    at: 12,
    pa: 11,
    tpDice: 1,
    tpBonus: 3,
    rs: 2,
    iniBase: 11,
    weapon: "Kurzschwert",
    intro: "Gebrochene Nase, breites Grinsen, ruhige Hand am Schwertgriff.",
  },
  wegelagerer_armbrust: {
    id: "wegelagerer_armbrust",
    name: "Armbrustschütze",
    le: 18,
    at: 11,
    pa: 8,
    tpDice: 2,
    tpBonus: 1,
    rs: 1,
    iniBase: 9,
    weapon: "leichte Armbrust",
  },
  wegelagerer_stab: {
    id: "wegelagerer_stab",
    name: "Wegelagerer mit Knüppel",
    le: 20,
    at: 10,
    pa: 9,
    tpDice: 1,
    tpBonus: 2,
    rs: 1,
    iniBase: 10,
    weapon: "Knüppel",
  },
  glatzkopf: {
    id: "glatzkopf",
    name: "Glatzköpfiger Söldner",
    le: 32,
    at: 12,
    pa: 10,
    tpDice: 1,
    tpBonus: 4,
    rs: 1,
    iniBase: 10,
    weapon: "Faust wie ein Schmiedehammer",
    intro: "Massig, schwitzend, riecht nach Bier und schlechter Laune.",
  },
  spiegelhueter: {
    id: "spiegelhueter",
    name: "Hüter des Spiegels",
    le: 40,
    at: 14,
    pa: 13,
    tpDice: 2,
    tpBonus: 2,
    rs: 3,
    iniBase: 14,
    weapon: "Schattenklinge",
    intro:
      "Eine Gestalt, geformt aus euren eigenen Umrissen. Sie spricht mit Wendelmirs Stimme.",
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
  return {
    id: "hero",
    name: ch.name,
    side: "hero",
    le: ch.le,
    leMax: ch.le,
    at: profile.atBase + atBonus,
    pa: profile.paBase + paBonus,
    tpDice: profile.tpDice,
    tpBonus: profile.tpBonus + tpKKBonus,
    rs: profile.rs,
    iniBase: a.MU,
    weapon: profile.weapon,
  };
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

function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}
function d20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export type CombatEventKind =
  | "round-start"
  | "ini"
  | "attack-hit"
  | "attack-miss"
  | "parry-success"
  | "damage"
  | "downed"
  | "end-victory"
  | "end-defeat";

export interface CombatEvent {
  kind: CombatEventKind;
  text: string;
  /** Würfel, die diesen Schritt bestimmt haben — für die Anzeige unten. */
  dice?: { label: string; value: number; target?: number; success?: boolean }[];
  /** Aktuelle LE-Snapshots nach dem Event (für Balken-Animation). */
  snapshot: { id: string; le: number }[];
  /** Wer hat zuletzt zugeschlagen (für Welt-Animation). */
  actorId?: string;
  targetId?: string;
}

export interface CombatResult {
  victory: boolean;
  events: CombatEvent[];
  /** LE-Status des Helden am Ende (für Übernahme in Charakterbogen). */
  heroLeFinal: number;
}

function snapshot(all: Combatant[]): { id: string; le: number }[] {
  return all.map((c) => ({ id: c.id, le: c.le }));
}

function alive(c: Combatant): boolean {
  return c.le > 0;
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
  hero: Combatant,
  foes: Combatant[],
  opts: { maxRounds?: number } = {},
): CombatResult {
  const maxRounds = opts.maxRounds ?? 20;
  const all: Combatant[] = [hero, ...foes];
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

  for (let round = 1; round <= maxRounds; round++) {
    if (!alive(hero)) break;
    if (foes.every((f) => !alive(f))) break;

    // Initiative pro Runde — höchste zuerst.
    const order = [hero, ...foes.filter(alive)]
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
      if (!alive(hero)) break;
      if (foes.every((f) => !alive(f))) break;

      const target =
        actor.side === "hero" ? pickFoeTarget(foes) : alive(hero) ? hero : null;
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

  const victory = alive(hero) && foes.every((f) => !alive(f));
  events.push({
    kind: victory ? "end-victory" : "end-defeat",
    text: victory
      ? "Der Kampf ist vorbei. Ihr habt überlebt."
      : "Der Kampf ist verloren. Brem zieht euch raus.",
    snapshot: snapshot(all),
  });

  return {
    victory,
    events,
    heroLeFinal: hero.le,
  };
}
