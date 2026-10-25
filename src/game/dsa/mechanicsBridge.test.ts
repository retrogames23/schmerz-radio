import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { addItem, removeItem, type HeroGear } from "./gear";
import { parseMasterTurn, fallbackEnemyStat } from "./llmAdventure";
import { rollAttributeCheck } from "./pendingMasterNotes";

const base: HeroGear = { weaponId: null, armorId: null, shieldId: null, items: [] } as unknown as HeroGear;

describe("DSA-Mechanik-Brücke", () => {
  it("zieht bei '2 Silbertaler' nur zwei vom Stapel ab", () => {
    const g = addItem(base, { name: "Silbertaler", count: 10 });
    assert.equal(removeItem(g, "2 Silbertaler").items[0].count, 8);
  });

  it("entfernt ohne Mengenangabe den ganzen Eintrag", () => {
    const g = addItem(base, { name: "Fackel", count: 10 });
    assert.equal(removeItem(g, "Fackel").items.length, 0);
  });

  it("liest LE- und AE-Änderungen des Meisters", () => {
    const p = parseMasterTurn("[TJARK] Du stürzt. [LE: -4] [AE: -3]");
    assert.equal(p.leDelta, -4);
    assert.equal(p.aeDelta, -3);
  });

  it("verwirft Kämpfe mit erfundenen Gegnern nicht", () => {
    const p = parseMasterTurn("[TJARK] Ein Schatten! [COMBAT: maraskanischer_assassine]");
    assert.deepEqual(p.combat?.enemyIds, ["maraskanischer_assassine"]);
    assert.equal(fallbackEnemyStat("maraskanischer_assassine").name, "Maraskanischer Assassine");
  });

  it("Probe: Wurf ≤ Wert − Erschwernis gelingt, 20 misslingt immer", () => {
    assert.equal(rollAttributeCheck(12, 2, 10).success, true);
    assert.equal(rollAttributeCheck(12, 2, 11).success, false);
    assert.equal(rollAttributeCheck(25, 0, 20).success, false);
    assert.equal(rollAttributeCheck(3, 5, 1).success, true);
  });
});
