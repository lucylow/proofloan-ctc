import { describe, expect, it, vi } from "vitest";
import { CircuitBreaker } from "../server/attestcoin/circuitBreaker";

describe("Attestcoin circuit breaker", () => {
  it("opens after repeated failures", async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker(2, 1000);

    await expect(breaker.run(async () => { throw new Error("boom"); })).rejects.toThrow();
    await expect(breaker.run(async () => { throw new Error("boom"); })).rejects.toThrow();

    expect(breaker.diagnostics().state).toBe("open");
    vi.useRealTimers();
  });
});
