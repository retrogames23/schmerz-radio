import { describe, it, expect } from "vitest";
import { applyMoneyDelta, parseMoney, purseKreuzer, formatKreuzer } from "./money";
import { addItem, removeItem, emptyGear } from "./gear";
import { parseMasterTurn } from "./llmAdventure";

describe("DSA-Geld", () => {
  it("1 Dukat = 10 Silbertaler = 100 Heller = 1000 Kreuzer", () => {
    expect(parseMoney("+1 Dukaten")).toBe(1000);
    expect(parseMoney("10 Silbertaler")).toBe(1000);
    expect(parseMoney("100 Heller")).toBe(1000);
  });
  it("Zahlung mit Wechselgeld", () => {
    const g = applyMoneyDelta(emptyGear(), 1000);
    const paid = applyMoneyDelta(g, parseMoney("-3 Silbertaler 4 Heller")!);
    expect(purseKreuzer(paid)).toBe(660);
    expect(formatKreuzer(660)).toBe("6 S, 6 H");
  });
  it("Münzen per ITEM+ landen in der Geldkatze", () => {
    const g = addItem(emptyGear(), { name: "Dukaten", count: 5 });
    expect(purseKreuzer(g)).toBe(5000);
    expect(purseKreuzer(removeItem(g, "2 Dukaten"))).toBe(3000);
  });
  it("Parser liest [GELD]-Marker", () => {
    const p = parseMasterTurn("[TJARK] Der Baron zahlt.\n[GELD: +12 Dukaten]");
    expect(p.moneyDelta).toBe(12000);
  });
});
