import { test } from "node:test";
import assert from "node:assert/strict";
import { createWalkVisit, PLAZA_WALK, PLAZA_CHARACTERS } from "./ambientWalk";

test("a person appears at most once per scene visit", () => {
  const visit = createWalkVisit(() => 0.999);
  visit.sample(0);
  assert.equal(visit.sample(2499), null);
  assert.equal(visit.sample(2500)?.progress, 0);
  assert.equal(visit.sample(32499)?.character.id, "walker");
  assert.equal(visit.sample(32500), null);
  const seen: string[] = [];
  for (let now = 33000; now < 1500000; now += 500) {
    const sample = visit.sample(now);
    if (sample && seen.at(-1) !== sample.character.id) seen.push(sample.character.id);
  }
  assert.equal(seen.includes("walker"), false);
  assert.equal(new Set(seen).size, 5);
  assert.equal(visit.finished, true);
  assert.equal(visit.sample(2000000), null);
});

test("leaving and re-entering allows one new appearance", () => {
  const first = createWalkVisit(() => 0.999);
  first.sample(0);
  first.sample(32500);
  const next = createWalkVisit(() => 0.999);
  next.sample(40000);
  assert.equal(next.sample(42500)?.progress, 0);
  assert.equal(first.sample(42500), null);
});

test("subsequent entrances are between twenty seconds and one minute apart", () => {
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    const visit = createWalkVisit(random);
    assert.equal(visit.schedule[0]?.intervalMs, 2500);
    for (const entry of visit.schedule.slice(1)) {
      assert.ok(entry.intervalMs >= 20000);
      assert.ok(entry.intervalMs <= 60000);
    }
  }
  assert.equal(PLAZA_WALK.minIntervalMs, 20000);
  assert.equal(PLAZA_WALK.maxIntervalMs, 60000);
});

test("random order contains all six characters exactly once", () => {
  const a = createWalkVisit(() => 0).schedule.map((entry) => entry.character.id);
  const b = createWalkVisit(() => 0.999).schedule.map((entry) => entry.character.id);
  assert.equal(new Set(a).size, 6);
  assert.deepEqual([...a].sort(), PLAZA_CHARACTERS.map((c) => c.id).sort());
  assert.notDeepEqual(a, b);
});

test("characters have different walking speeds", () => {
  assert.equal(new Set(PLAZA_CHARACTERS.map((c) => c.durationMs)).size, 6);
});

test("conversation and hidden-tab pauses freeze the visit without losing an appearance", () => {
  const visit = createWalkVisit(() => 0.999);
  visit.sample(0);
  const before = visit.sample(15000);
  assert.ok(before);
  const paused = visit.sample(600000, true);
  assert.equal(paused?.progress, before.progress);
  assert.equal(paused?.frame, 2);
  const after = visit.sample(601000);
  assert.equal(after?.character.id, "walker");
  assert.equal(after?.progress, before.progress + 1000 / 30000);
});