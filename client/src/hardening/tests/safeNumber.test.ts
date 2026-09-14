import { describe, expect, it } from "vitest";
import { parseBoundedNumber, parseFiniteNumber, safePercent } from "../safeNumber";

describe("safe numbers", () => {
  it("handles invalid values", () => expect(parseFiniteNumber("nope", 7)).toBe(7));
  it("clamps values", () => expect(parseBoundedNumber(200, 0, 100, 0)).toBe(100));
  it("clamps percentages", () => expect(safePercent(-1)).toBe(0));
});
