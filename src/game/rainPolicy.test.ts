import { describe, expect, test } from "bun:test";
import { canAnimateRain } from "./rainPolicy";

describe("rain device policy", () => {
  test("phones never animate rain, including landscape", () => {
    expect(canAnimateRain(390, false, false, false)).toBe(false);
    expect(canAnimateRain(844, false, false, false)).toBe(false);
  });
  test("wide touch tablets never animate rain", () => {
    expect(canAnimateRain(1024, false, false, false)).toBe(false);
  });
  test("desktop rain remains enabled unless motion is reduced", () => {
    expect(canAnimateRain(1280, true, true, false)).toBe(true);
    expect(canAnimateRain(1280, true, true, true)).toBe(false);
    expect(canAnimateRain(767, true, true, false)).toBe(false);
  });
});