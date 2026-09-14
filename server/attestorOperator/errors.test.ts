import { describe, expect, it } from "vitest";
import {
  OperatorError,
  isOperatorError,
  normalizeOperatorError,
  parseAtomicBalance,
  parseBoundedInteger,
  trpcCodeForOperatorError,
} from "./errors";
import { AttestorOperatorService } from "./operatorService";
import { OperatorRpcManager } from "./rpc";
import { currentEpoch, secondsToEpochEnd } from "./epoch";
import { mergeConfig } from "./config";
import { officialOperatorPolicy } from "./policy";
import type { OperatorAccount, OperatorOnChainState } from "./types";

const attestor: OperatorAccount = { address: "A", role: "attestor", keyType: "sr25519", secretConfigured: true, custody: "hot" };
const stash: OperatorAccount = { address: "B", role: "stash", keyType: "sr25519", secretConfigured: false, custody: "cold" };
const TESTNET_CHAIN_KEY = officialOperatorPolicy("cc3-testnet").chainKey;

function state(overrides: Partial<OperatorOnChainState> = {}): OperatorOnChainState {
  return {
    operatorId: "x",
    environment: "cc3-testnet",
    chainKey: TESTNET_CHAIN_KEY,
    attestorAddress: "A",
    stashAddress: "B",
    authorized: true,
    registered: false,
    status: "unregistered",
    elected: false,
    active: false,
    ...overrides,
  };
}

describe("operator error handling", () => {
  it("preserves typed operator errors", () => {
    const error = new OperatorError("POLICY", "Unsupported chain key 9 for cc3-testnet.");
    expect(normalizeOperatorError(error)).toBe(error);
    expect(isOperatorError(error)).toBe(true);
    expect(trpcCodeForOperatorError(error)).toBe("BAD_REQUEST");
  });

  it("maps unhealthy RPC failures as retriable", () => {
    const rpc = new OperatorRpcManager([
      { role: "cc3", url: "wss://a", scheme: "wss", selfHosted: true, healthy: false, supportsHistoricalBlocks: false, maxConcurrency: 8 },
    ]);
    try {
      rpc.choose("cc3");
      throw new Error("expected rpc failure");
    } catch (error) {
      expect(error).toBeInstanceOf(OperatorError);
      expect((error as OperatorError).code).toBe("RPC");
      expect((error as OperatorError).retriable).toBe(true);
      expect(trpcCodeForOperatorError(error as OperatorError)).toBe("TIMEOUT");
    }
  });

  it("treats malformed atomic balances as blocked readiness instead of throwing", () => {
    const service = new AttestorOperatorService({
      operatorId: "x",
      environment: "cc3-testnet",
      chainKey: TESTNET_CHAIN_KEY,
      node: {},
      attestor: { ...attestor, fundedBalanceAtomic: "not-a-number" },
      stash: { ...stash, fundedBalanceAtomic: "1.5e18" },
      state: state(),
    });
    const readiness = service.evaluateCurrent();
    expect(readiness.readiness).toBe("blocked");
    expect(readiness.checks.some(check => check.id === "attestor-balance-parse" && check.ok === false)).toBe(true);
    expect(readiness.checks.some(check => check.id === "stash-balance-parse" && check.ok === false)).toBe(true);
    expect(parseAtomicBalance("1000")).toEqual({ ok: true, value: 1000n });
  });

  it("fails closed on invalid chain keys and epoch inputs", () => {
    const service = new AttestorOperatorService({
      operatorId: "x",
      environment: "cc3-testnet",
      chainKey: Number.NaN,
      node: {},
      attestor,
      stash,
      state: state({ chainKey: Number.NaN }),
    });
    const readiness = service.evaluateCurrent();
    expect(readiness.readiness).toBe("blocked");
    expect(readiness.checks[0]?.id).toBe("operator-error");
    expect(() => service.policy()).toThrow(OperatorError);
    expect(currentEpoch(Number.NaN, 0, 3600)).toBe(0);
    expect(secondsToEpochEnd(1, 0, 0)).toBe(0);
    expect(parseBoundedInteger("abc", 7, { min: 1 })).toBe(7);
  });

  it("rejects malformed CLI/config numbers as typed config errors", () => {
    expect(() =>
      mergeConfig({ name: "file-node", chainKey: Number.NaN } as never, {}, {}),
    ).toThrow(OperatorError);
  });
});
