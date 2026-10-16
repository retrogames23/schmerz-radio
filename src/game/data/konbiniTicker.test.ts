import { describe, expect, it } from "bun:test";
import { getKonbiniTickerMessages, getKonbiniTickerText, getTickerDurationSeconds } from "./konbiniTicker";

describe("Konbini-Laufband", () => {
  for (const pool of ["e67", "e71"] as const) {
    it(`${pool}: läuft mindestens 30 Minuten ohne Wiederholung`, () => {
      const msgs = getKonbiniTickerMessages(pool);
      expect(new Set(msgs).size).toBe(msgs.length);
      expect(getTickerDurationSeconds(getKonbiniTickerText(pool))).toBeGreaterThanOrEqual(1800);
    });
  }
});
