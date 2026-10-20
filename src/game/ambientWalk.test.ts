import { test } from "node:test";
import assert from "node:assert/strict";
import { createWalkVisit, PLAZA_WALK } from "./ambientWalk";

test("a person appears at most once per scene visit", () => {
  const visit = createWalkVisit();
  visit.sample(0);
  assert.equal(visit.sample(2499), null);
  assert.equal(visit.sample(2500)?.progress, 0);
  assert.equal(visit.sample(2500 + PLAZA_WALK.durationMs - 1)?.frame !== undefined, true);
  assert.equal(visit.sample(2500 + PLAZA_WALK.durationMs), null);
  assert.equal(visit.finished, true);
  assert.equal(visit.sample(100000), null);
  assert.equal(visit.sample(200000), null);
});

test("leaving and re-entering allows one new appearance", () => {
  const first = createWalkVisit();
  first.sample(0);
  first.sample(32500);
  const next = createWalkVisit();
  next.sample(40000);
  assert.equal(next.sample(42500)?.progress, 0);
  assert.equal(first.sample(42500), null);
});