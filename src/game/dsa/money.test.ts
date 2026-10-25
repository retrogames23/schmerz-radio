import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { applyMoneyDelta, parseMoney, purseKreuzer, formatKreuzer } from "./money";
import { addItem, removeItem, emptyGear } from "./gear";
import { parseMasterTurn } from "./llmAdventure";

describe("DSA-Geld", () => {
  it("1 Dukat = 10 Silbertaler = 100 Heller = 1000 Kreuzer", () => {
    assert.equal(parseMoney("+1 Dukaten"), 1000);
    assert.equal(parseMoney("10 Silbertaler"), 1000);
    assert.equal(parseMoney("100 Heller"), 1000);
  });
  it("Zahlung mit Wechselgeld", () => {
    const g = applyMoneyDelta(emptyGear(), 1000);
    const paid = applyMoneyDelta(g, parseMoney("-3 Silbertaler 4 Heller")!);
    assert.equal(purseKreuzer(paid), 660);
    assert.equal(formatKreuzer(660), "6 S, 6 H");
  });
  it("Münzen per ITEM+ landen in der Geldkatze", () => {
    const g = addItem(emptyGear(), { name: "Dukaten", count: 5 });
    assert.equal(purseKreuzer(g), 5000);
    assert.equal(purseKreuzer(removeItem(g, "2 Dukaten")), 3000);
  });
  it("Parser liest [GELD]-Marker", () => {
    const p = parseMasterTurn("[TJARK] Der Baron zahlt.\n[GELD: +12 Dukaten]");
    assert.equal(p.moneyDelta, 12000);
  });
});
