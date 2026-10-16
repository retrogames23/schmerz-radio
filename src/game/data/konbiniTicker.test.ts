import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getKonbiniTickerMessages, getKonbiniTickerText, getTickerDurationSeconds } from "./konbiniTicker";

describe("Konbini-Laufband", () => {
  for (const pool of ["e67", "e67act2", "e71"] as const) {
    test(`${pool}: läuft mindestens 30 Minuten ohne Wiederholung`, () => {
      const msgs = getKonbiniTickerMessages(pool);
      assert.equal(new Set(msgs).size, msgs.length);
      assert.ok(getTickerDurationSeconds(getKonbiniTickerText(pool)) >= 1800);
    });
  }
});
