import { describe, expect, it } from "vitest";
import { TtlCache } from "../server/attestcoin/cache";

describe("Attestcoin TTL cache", () => {
  it("returns fresh entries", () => {
    const cache = new TtlCache<number>();
    cache.set("proof", 42, 1000, 10);
    expect(cache.get("proof", 500)).toBe(42);
  });

  it("expires entries deterministically", () => {
    const cache = new TtlCache<number>();
    cache.set("proof", 42, 1000, 10);
    expect(cache.get("proof", 1010)).toBeUndefined();
  });
});
