import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { rollThreeD20Probe } from "./rules/probe";
import { gearRestriction } from "./gear";
import { parseMasterTurn } from "./llmAdventure";
import { rollTalentCheck } from "./pendingMasterNotes";
import { SPELLS, COMBAT_SPELL_IDS } from "./rules/spells";
import { createCombatState, resolveRound, stufeFromAp, type Combatant } from "./combat";

const attrs = { MU: 12, KL: 13, CH: 12, FF: 11, GE: 12, IN: 12, KK: 11 };
const none = { armorId: null, shieldId: null };

describe("DSA3-Talentprobe", () => {
  it("gleicht Überwürfe aus dem TaW aus", () => {
    // 14 gegen 12 → 2 Punkte Überwurf, TaW 3 bleibt 1 übrig
    const r = rollThreeD20Probe([12, 12, 12], 3, 0, [14, 5, 5]);
    assert.equal(r.success, true);
    assert.equal(r.pointsLeft, 1);
  });
  it("misslingt, wenn der TaW nicht reicht", () => {
    assert.equal(rollThreeD20Probe([12, 12, 12], 1, 0, [14, 5, 5]).success, false);
  });
  it("senkt bei Erschwernis über TaW alle drei Eigenschaften", () => {
    const r = rollThreeD20Probe([12, 12, 12], 2, 5, [10, 10, 10]);
    assert.deepEqual(r.targets, [9, 9, 9]);
    assert.equal(r.success, false);
  });
  it("Doppel-1 gelingt, Doppel-20 misslingt", () => {
    assert.equal(rollThreeD20Probe([3, 3, 3], 0, 10, [1, 1, 20]).success, true);
    assert.equal(rollThreeD20Probe([20, 20, 20], 15, 0, [20, 20, 1]).success, false);
  });
  it("erkennt [CHECK: Klettern +2] als Talentprobe", () => {
    const p = parseMasterTurn("[TJARK] Die Mauer ist glitschig. [CHECK: Klettern +2]");
    assert.equal(p.check?.talentId, "klettern");
    assert.equal(p.check?.modifier, 2);
  });
  it("erkennt [CHECK: GE] weiter als Eigenschaftsprobe", () => {
    const p = parseMasterTurn("[TJARK] Ausweichen! [CHECK: GE -1]");
    assert.equal(p.check?.attr, "GE");
    assert.equal(p.check?.modifier, -1);
  });
  it("meldet das Ergebnis mit TaW und TaP* an den Meister", () => {
    const r = rollTalentCheck("klettern", attrs, 4, 0, [5, 5, 5]);
    assert.match(r.line, /^\[PROBE\] Klettern ±0: 3W20=5\/5\/5 .*TaW 4 — gelungen \(TaP\* 4\)$/);
  });
});

describe("DSA3-Rüstungsregeln", () => {
  it("Magier: keine Rüstung über RS 2", () => {
    assert.notEqual(gearRestriction("magier", none, { armorId: "kettenhemd" }), null);
    assert.equal(gearRestriction("magier", none, { armorId: "lederruestung" }), null);
  });
  it("Magier: Schild zählt als RS 1 mit", () => {
    assert.notEqual(gearRestriction("magier", { armorId: "lederruestung", shieldId: null }, { shieldId: "buckler" }), null);
    assert.equal(gearRestriction("magier", { armorId: "lederwams", shieldId: null }, { shieldId: "buckler" }), null);
  });
  it("Magier: keine Waffe über 1W6+2 TP", () => {
    assert.notEqual(gearRestriction("magier", none, { weaponId: "langschwert" }), null);
    assert.equal(gearRestriction("magier", none, { weaponId: "stab" }), null);
    assert.equal(gearRestriction("magier", none, { weaponId: "dolch" }), null);
  });
  it("Elf und Zwerg: keine Ritterrüstung", () => {
    assert.notEqual(gearRestriction("elf", none, { armorId: "plattenharnisch" }), null);
    assert.notEqual(gearRestriction("zwerg", none, { armorId: "plattenharnisch" }), null);
    assert.equal(gearRestriction("krieger", none, { armorId: "plattenharnisch" }), null);
  });
});

describe("DSA3-Kampfzauber", () => {
  const mage = (spells: Record<string, number>, ae = 30): Combatant => ({
    id: "hero", name: "Layard", side: "hero", le: 20, leMax: 20, at: 9, pa: 8,
    tpDice: 1, tpBonus: 2, rs: 0, iniBase: 12, weapon: "Stab", attrs: { ...attrs, KL: 20, GE: 20, KK: 20, IN: 20, CH: 20, MU: 20, FF: 20 },
    ae, aeMax: ae, spells, classId: "magier", stufe: 1,
  });
  const foe = (): Combatant => ({
    id: "f#0", name: "Ritter", side: "foe", le: 40, leMax: 40, at: 1, pa: 1,
    tpDice: 1, tpBonus: 0, rs: 6, iniBase: 1, weapon: "Schwert",
  });

  it("Balsam Salabunde ist im Kampf nicht wirkbar", () => {
    assert.equal(COMBAT_SPELL_IDS.has("balsam_salabunde"), false);
    assert.equal(SPELLS.find((s) => s.id === "balsam_salabunde")?.minCost, 7);
  });
  it("Armatrutz, Axxeleratus, Horriphobus und Bannbaladin sind Kampfzauber", () => {
    for (const id of ["armatrutz", "axxeleratus", "horriphobus", "bannbaladin", "ignifaxius", "fulminictus", "blitz_dich_find"]) {
      assert.equal(COMBAT_SPELL_IDS.has(id), true, id);
    }
  });
  it("Fulminictus durchdringt die Rüstung und kostet AsP = Schaden", () => {
    const st = createCombatState([mage({ fulminictus: 15 })], [foe()]);
    st.intent = { ...(st.intent ?? {}), layardSpellId: "fulminictus" } as never;
    resolveRound(st, "magic-none", { KL: 20, CH: 20 }, { intent: { layardSpellId: "fulminictus", yelvaSpellId: null, yelva: {}, brem: {}, notes: [] } as never });
    const lost = 40 - st.foes[0].le;
    assert.ok(lost >= 4, `Schaden ${lost}`);
    assert.equal(30 - (st.heroes[0].ae ?? 0), lost);
  });
  it("Blitz dich find blendet statt Schaden zu machen", () => {
    const st = createCombatState([mage({ blitz_dich_find: 15 })], [foe()]);
    resolveRound(st, "magic-none", { KL: 20, CH: 20 }, { intent: { layardSpellId: "blitz_dich_find", yelvaSpellId: null, yelva: {}, brem: {}, notes: [] } as never });
    assert.equal(st.foes[0].effectLabel, "geblendet");
    assert.equal(st.foes[0].atMod, -5);
  });
  it("Armatrutz kostet RS×RS AsP, mindestens 4", () => {
    const st = createCombatState([mage({ armatrutz: 15 }, 9)], [foe()]);
    resolveRound(st, "magic-none", { KL: 20, CH: 20 }, { intent: { layardSpellId: "armatrutz", yelvaSpellId: null, yelva: {}, brem: {}, notes: [] } as never });
    assert.equal(st.heroes[0].armatrutzRs, 3);
    assert.equal(st.heroes[0].ae, 0);
    assert.equal(st.heroes[0].rs, 3);
  });
  it("Stufe aus AP nach DSA3", () => {
    assert.equal(stufeFromAp(0), 1);
    assert.equal(stufeFromAp(100), 2);
    assert.equal(stufeFromAp(299), 2);
    assert.equal(stufeFromAp(300), 3);
  });
});

import { defaultTalents as _dt, upgradeToHero as _up } from "./advancement";
describe("DSA3-Grundtalente", () => {
  it("jeder neue Held hat Menschenkenntnis (mind. TaW 0)", () => {
    assert.equal(_dt("krieger").menschenkenntnis, 1);
    assert.equal(typeof _dt("magier").reiten, "number");
  });
  it("alte Helden werden aufgefüllt, Steigerungen bleiben", () => {
    const h = _up({ name: "A", className: "Krieger", classId: "krieger", attrs: {} as never, le: 30, ae: null, talents: { athletik: 9 } } as never)!;
    assert.equal(h.talents.athletik, 9);
    assert.equal(h.talents.menschenkenntnis, 0);
  });
});
