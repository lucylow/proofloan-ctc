import { describe, expect, it, vi } from "vitest";
import { TtlCache } from "../memoryCache";

describe("TTL cache", () => {
  it("expires values", () => {
    vi.useFakeTimers();
    const cache = new TtlCache<number>(1000);
    cache.set("x", 42);
    expect(cache.get("x")).toBe(42);
    vi.advanceTimersByTime(1001);
    expect(cache.get("x")).toBeUndefined();
    vi.useRealTimers();
  });
});
