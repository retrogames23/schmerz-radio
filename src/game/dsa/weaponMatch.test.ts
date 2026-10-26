import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
const expect = (v: unknown) => ({ toBe: (x: unknown) => assert.equal(v, x), toBeNull: () => assert.equal(v, null) });
import { matchWeaponId } from "./rules/weapons";
import { addItem, defaultGearFor, equipWeapon, emptyGear, withWeaponIds } from "./gear";

describe("Waffenerkennung", () => {
  it("erkennt Dolch im Gürtel als Dolch", () => expect(matchWeaponId("Dolch im Gürtel")).toBe("dolch"));
  it("Wurfmesser bleibt Wurfmesser", () => expect(matchWeaponId("Wurfmesser")).toBe("wurfmesser"));
  it("kurzer Säbel ist Säbel", () => expect(matchWeaponId("kurzer Säbel")).toBe("saebel"));
  it("Pfeile sind keine Waffe", () => expect(matchWeaponId("Pfeile im Köcher")).toBeNull());
  it("Meister-Beute Dolch bekommt TP", () => {
    const g = addItem(emptyGear(), { name: "Dolch" });
    expect(g.items[0].weaponId).toBe("dolch");
  });
  it("Krieger kann den Startdolch anlegen", () => {
    const g = withWeaponIds(defaultGearFor("krieger"));
    const dolch = g.items.find((i) => i.id === "dolch_im_guertel");
    assert.ok(dolch);
    expect(equipWeapon(g, dolch.id).weaponId).toBe("dolch");
  });
});

describe("Kaiser Retos Waffenkammer", () => {
  it("Tuzakmesser ist kein Dolch", () => expect(matchWeaponId("Tuzakmesser")).toBe("tuzakmesser"));
  it("Kriegsbeil vor Beil", () => expect(matchWeaponId("Kriegsbeil")).toBe("kriegsbeil"));
  it("Kriegsbogen vor Bogen", () => expect(matchWeaponId("Kriegsbogen")).toBe("kriegsbogen"));
  it("Lindwurmschläger erkannt", () => expect(matchWeaponId("Lindwurmschläger")).toBe("lindwurmschlaeger"));
});
