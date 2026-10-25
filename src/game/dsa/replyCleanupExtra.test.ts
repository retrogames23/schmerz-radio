import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeReply, cutParaphrasedRestart } from "./replyCleanup";

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

it("entfernt verstümmelte leere Klammern wie [ ?]", () => {
  assert.ok(!sanitizeReply("[ ?] [TJARK] Die Tür knarrt.").includes("[ ?]"));
  assert.ok(sanitizeReply("[TJARK] Die Tür knarrt.").includes("[TJARK]"));
});

it("cuts paraphrased opening restart", () => {
  const a = "[TJARK] In der milden Abendluft rauschen Karren über das Pflaster von Gareth, die goldene Kuppel des Praios-Tempels glänzt, Händler rufen ihre Waren aus.";
  const b = "[TJARK] Abendsonne vergoldet die Kuppel des Praios-Tempels, während Karren über das Pflaster von Gareth rauschen und Händler ihre Waren ausrufen.";
  assert.equal(cutParaphrasedRestart(a + "\n\n" + b), a);
});
it("keeps distinct follow-up paragraph", () => {
  const a = "[TJARK] In der milden Abendluft rauschen Karren über das Pflaster von Gareth, die goldene Kuppel des Praios-Tempels glänzt, Händler rufen ihre Waren aus.";
  const b = "Ein Tempeldiener in gelber Robe drängt sich durch die Menge, ein versiegeltes Schreiben in der Hand, und sucht mit hastigem Blick nach einem kräftigen Schwertträger.";
  assert.equal(cutParaphrasedRestart(a + "\n\n" + b), a + "\n\n" + b);
});
