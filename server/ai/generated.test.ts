import { describe, expect, it } from "vitest";
import * as generated from "./generated";

describe("generated AI scenario fixtures", () => {
  it("holds probability invariants across all 80 scenarios", () => {
    const failed: string[] = [];
    for (let index = 1; index <= 80; index++) {
      const id = String(index).padStart(3, "0");
      const invariant = (generated as Record<string, unknown>)[`scenarioInvariant_${id}`];
      if (typeof invariant !== "function" || !(invariant as () => boolean)()) failed.push(id);
    }
    expect(failed).toEqual([]);
  });
});
