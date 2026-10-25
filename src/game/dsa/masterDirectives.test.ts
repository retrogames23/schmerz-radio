import { test } from "node:test";
import assert from "node:assert/strict";
import { extractNpcMarkers, injectAuthorsNote, mergeNpcStates, sceneQueryFrom } from "./masterDirectives";

test("Regie-Notiz landet zwei Nachrichten vor Schluss", () => {
  const msgs = Array.from({ length: 7 }, (_, i) => ({ role: i ? "user" : "system", content: String(i) }));
  const out = injectAuthorsNote(msgs, 2, "NOTE");
  assert.equal(out.length, 8);
  assert.equal(out[5].content, "NOTE");
  assert.equal(out[7].content, "6");
});

test("kurzer Verlauf bekommt keine Regie-Notiz", () => {
  const msgs = [{ role: "system", content: "s" }, { role: "user", content: "u" }];
  assert.equal(injectAuthorsNote(msgs).length, 2);
});

test("NSC-Marker wird entfernt und übernommen", () => {
  const r = extractNpcMarkers("[TJARK] Der Wirt nickt.\n[NSC: Wirt Alrik | bestochen, gesprächig]");
  assert.equal(r.text, "[TJARK] Der Wirt nickt.");
  assert.deepEqual(r.updates, [{ name: "Wirt Alrik", note: "bestochen, gesprächig" }]);
});

test("gleicher NSC überschreibt alte Haltung", () => {
  const s = mergeNpcStates([{ name: "Brem", note: "ruhig", turn: 1 }], [{ name: "brem", note: "nervös" }], 4);
  assert.equal(s.length, 1);
  assert.equal(s[0].note, "nervös");
});

test("Schauplatzwechsel erzeugt Suchanfrage", () => {
  assert.match(sceneQueryFrom("[SCENE: tavern_gareth]\n[TJARK] Rauch hängt über den Tischen.") ?? "", /tavern gareth Rauch/);
  assert.equal(sceneQueryFrom("[TJARK] nichts"), null);
});
