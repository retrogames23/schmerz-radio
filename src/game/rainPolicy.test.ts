import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { canAnimateRain } from "./rainPolicy";

describe("rain device policy", () => {
  test("phones never animate rain, including landscape", () => {
    assert.equal(canAnimateRain(390, false, false, false), false);
    assert.equal(canAnimateRain(844, false, false, false), false);
  });
  test("wide touch tablets never animate rain", () => {
    assert.equal(canAnimateRain(1024, false, false, false), false);
  });
  test("desktop rain remains enabled unless motion is reduced", () => {
    assert.equal(canAnimateRain(1280, true, true, false), true);
    assert.equal(canAnimateRain(1280, true, true, true), false);
    assert.equal(canAnimateRain(767, true, true, false), false);
  });
});