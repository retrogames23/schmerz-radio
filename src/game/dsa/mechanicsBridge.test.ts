import { describe, expect, it } from "vitest";
import { addItem, removeItem, type HeroGear } from "./gear";
import { parseMasterTurn, fallbackEnemyStat } from "./llmAdventure";
import { rollAttributeCheck } from "./pendingMasterNotes";

const base: HeroGear = { weaponId: null, armorId: null, shieldId: null, items: [] } as unknown as HeroGear;

describe("DSA-Mechanik-Brücke", () => {
  it("zieht bei '2 Silbertaler' nur zwei vom Stapel ab", () => {
    const g = addItem(base, { name: "Silbertaler", count: 10 });
    expect(removeItem(g, "2 Silbertaler").items[0].count).toBe(8);
  });

  it("entfernt ohne Mengenangabe den ganzen Eintrag", () => {
    const g = addItem(base, { name: "Silbertaler", count: 10 });
    expect(removeItem(g, "Silbertaler").items).toHaveLength(0);
  });

  it("liest LE- und AE-Änderungen des Meisters", () => {
    const p = parseMasterTurn("[TJARK] Du stürzt. [LE: -4] [AE: -3]");
    expect(p.leDelta).toBe(-4);
    expect(p.aeDelta).toBe(-3);
  });

  it("verwirft Kämpfe mit erfundenen Gegnern nicht", () => {
    const p = parseMasterTurn("[TJARK] Ein Schatten! [COMBAT: maraskanischer_assassine]");
    expect(p.combat?.enemyIds).toEqual(["maraskanischer_assassine"]);
    expect(fallbackEnemyStat("maraskanischer_assassine").name).toBe("Maraskanischer Assassine");
  });

  it("Probe: Wurf ≤ Wert − Erschwernis gelingt, 20 misslingt immer", () => {
    expect(rollAttributeCheck(12, 2, 10).success).toBe(true);
    expect(rollAttributeCheck(12, 2, 11).success).toBe(false);
    expect(rollAttributeCheck(25, 0, 20).success).toBe(false);
    expect(rollAttributeCheck(3, 5, 1).success).toBe(true);
  });
});
