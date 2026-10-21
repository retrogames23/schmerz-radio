import { test } from "node:test";
import assert from "node:assert/strict";
import { PLAZA_CHARACTERS } from "../ambientWalk";
import { plazaDialogs } from "./plaza";

test("every plaza character has a reachable conversation", () => {
  for (const character of PLAZA_CHARACTERS) {
    const tree = plazaDialogs[`plaza_${character.id}`];
    assert.ok(tree);
    assert.ok(tree.lines[tree.start]);
    for (const line of Object.values(tree.lines)) {
      if (line.next) assert.ok(tree.lines[line.next]);
      for (const choice of line.choices ?? []) {
        if (choice.next) assert.ok(tree.lines[choice.next]);
      }
    }
  }
});

test("some encounters are short while others support branching smalltalk", () => {
  const trees = Object.values(plazaDialogs);
  assert.equal(trees.filter((tree) => tree.lines[tree.start]?.end).length, 2);
  assert.equal(trees.filter((tree) => (tree.lines[tree.start]?.choices?.length ?? 0) > 1).length, 4);
  assert.ok(trees.every((tree) => !tree.onEnd));
});