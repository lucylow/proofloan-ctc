import { describe, expect, it, vi } from "vitest";
import { RequestCache } from "../requestCache";

describe("request cache", () => {
  it("prevents duplicate executions during ttl window", async () => {
    const cache = new RequestCache<number>(1000);
    const fn = vi.fn().mockResolvedValue(42);
    expect(await cache.getOrRun("x", fn)).toBe(42);
    expect(await cache.getOrRun("x", fn)).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
