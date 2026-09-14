import { describe, expect, it } from "vitest";
import { promiseAllSettledValues } from "../safePromiseAll";

describe("safe promise all", () => {
  it("preserves successful results while isolating failures", async () => {
    const result = await promiseAllSettledValues([
      Promise.resolve(1),
      Promise.reject(new Error("nope")),
      Promise.resolve(3),
    ]);
    expect(result.values).toEqual([1, 3]);
    expect(result.errors).toHaveLength(1);
  });
});
