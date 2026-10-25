import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeReply } from "./replyCleanup";

describe("sanitizeReply", () => {
  it("entfernt CJK-/Vollbreiten-Glitches", () => {
    assert.equal(sanitizeReply("[TJARK] Der Wind heult.＿日本"), "[TJARK] Der Wind heult.");
  });
  it("verwirft abgebrochene Marker am Ende", () => {
    assert.equal(sanitizeReply("[TJARK] Klettere.\n[CHECK: Klettern +2"), "[TJARK] Klettere.");
  });
  it("behält vollständige Marker", () => {
    assert.equal(sanitizeReply("[TJARK] Klettere.\n[CHECK: Klettern +2]"), "[TJARK] Klettere.\n[CHECK: Klettern +2]");
  });
  it("entfernt Assistenten-Floskel am Anfang", () => {
    assert.equal(sanitizeReply("Hier ist die Fortsetzung:\n[TJARK] Nacht."), "[TJARK] Nacht.");
  });
  it("behält deutsche Umlaute und Gedankenstriche", () => {
    assert.equal(sanitizeReply("[BREM] Grüß dich — Öhm, „ja“."), "[BREM] Grüß dich — Öhm, „ja“.");
  });
});
