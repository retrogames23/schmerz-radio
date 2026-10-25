import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeReply } from "./replyCleanup";

describe("sanitizeReply – Fremdschrift & Dopplung", () => {
  it("entfernt Thai-Spam-Token", () => {
    assert.equal(sanitizeReply("[TJARK] Wie näherst du dich? ฟรีเครดิต"), "[TJARK] Wie näherst du dich?");
  });
  it("schneidet doppelt ausgegebene Eröffnung ab", () => {
    const s = "Du kannst mich jederzeit mit dem Stichwort Outtime fragen, wenn du magst.";
    const out = sanitizeReply(`[TJARK] ${s} Ihr sitzt im Hirsch.\n[TJARK] ${s} Ihr sitzt im Hirsch.`);
    assert.equal(out, `[TJARK] ${s} Ihr sitzt im Hirsch.`);
  });
  it("lässt normale Antworten unverändert", () => {
    const t = "[TJARK] Der Regen trommelt gegen die Scheiben des Schankraums.\n[BREM] Na toll.";
    assert.equal(sanitizeReply(t), t);
  });
});

import { sanitizeReply as sanitizeStub } from "./replyCleanup";
test("entfernt verstümmelte leere Klammern", () => {
  expect(sanitizeStub("[ ?] [TJARK] Die Tür knarrt.")).not.toContain("[ ?]");
  expect(sanitizeStub("[TJARK] Die Tür knarrt.")).toContain("[TJARK]");
});
