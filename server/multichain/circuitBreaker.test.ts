import { describe, expect, it, vi } from "vitest";
import { NamedCircuitBreaker, getNamedCircuit, resetNamedCircuits } from "./circuitBreaker";

describe("named RPC/proof circuit breaker", () => {
  it("opens after repeated failures and recovers after cooldown", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const breaker = new NamedCircuitBreaker("proof:cc3-testnet:sepolia", 2, 1_000);

    await expect(breaker.run(async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    await expect(breaker.run(async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(breaker.diagnostics(0).state).toBe("open");

    await expect(breaker.run(async () => "late", 0)).rejects.toThrow(/circuit 'proof:cc3-testnet:sepolia' is open/);

    const recovered = await breaker.run(async () => "ok", 1_000);
    expect(recovered).toBe("ok");
    expect(breaker.diagnostics(1_000).state).toBe("closed");
    vi.useRealTimers();
  });

  it("reuses named circuits from the registry", () => {
    resetNamedCircuits();
    const first = getNamedCircuit("rpc:source:ethereum-sepolia");
    const second = getNamedCircuit("rpc:source:ethereum-sepolia");
    expect(second).toBe(first);
  });
});
