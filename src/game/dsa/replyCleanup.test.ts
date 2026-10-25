import { describe, expect, it } from "vitest";
import { sanitizeReply } from "./replyCleanup";

describe("sanitizeReply", () => {
  it("entfernt CJK-/Vollbreiten-Glitches", () => {
    expect(sanitizeReply("[TJARK] Der Wind heult.＿日本")).toBe("[TJARK] Der Wind heult.");
  });
  it("verwirft abgebrochene Marker am Ende", () => {
    expect(sanitizeReply("[TJARK] Klettere.\n[CHECK: Klettern +2")).toBe("[TJARK] Klettere.");
  });
  it("behält vollständige Marker", () => {
    expect(sanitizeReply("[TJARK] Klettere.\n[CHECK: Klettern +2]")).toBe("[TJARK] Klettere.\n[CHECK: Klettern +2]");
  });
  it("entfernt Assistenten-Floskel am Anfang", () => {
    expect(sanitizeReply("Hier ist die Fortsetzung:\n[TJARK] Nacht.")).toBe("[TJARK] Nacht.");
  });
  it("behält deutsche Umlaute und Gedankenstriche", () => {
    expect(sanitizeReply("[BREM] Grüß dich — Öhm, „ja“.")).toBe("[BREM] Grüß dich — Öhm, „ja“.");
  });
});
