import { describe, expect, it, vi } from "vitest";
import { CircuitBreaker } from "../circuitBreaker";

describe("circuit breaker", () => {
  it("opens after repeated failures", async () => {
    const breaker = new CircuitBreaker(2, 10_000);
    const fn = vi.fn().mockRejectedValue(new Error("boom"));

    await expect(breaker.run(fn)).rejects.toThrow();
    await expect(breaker.run(fn)).rejects.toThrow();
    expect(breaker.getState()).toBe("open");
    await expect(breaker.run(fn)).rejects.toThrow(/temporarily disabled/);
  });
});
