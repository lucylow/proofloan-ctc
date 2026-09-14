import { describe, expect, it } from "vitest";
import { creditcoinRpcUrls, normalizeRpcFailure, sourceRpcUrlsFor } from "./rpc";
import { FailoverExhaustedError } from "./failover";
import { AttestcoinError } from "../attestcoin/errors";
import { resolveSourceChain } from "./registry";

describe("RPC construction", () => {
  it("builds source RPC lists from the registry plus optional env overrides", () => {
    const sepolia = sourceRpcUrlsFor("Ethereum Sepolia");
    expect(sepolia[0]).toMatch(/^https?:\/\//);
    expect(sepolia.length).toBeGreaterThan(0);
    expect(resolveSourceChain("Polygon Amoy").rpcUrls.length).toBeGreaterThan(0);
  });

  it("exposes Creditcoin RPC failover candidates for the active environment", () => {
    const urls = creditcoinRpcUrls();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toContain("creditcoin");
  });

  it("normalizes exhausted failover as a retriable source RPC error", () => {
    expect(() =>
      normalizeRpcFailure("source:ethereum-sepolia", new FailoverExhaustedError("source:ethereum-sepolia", [])),
    ).toThrow(AttestcoinError);
    try {
      normalizeRpcFailure("source:ethereum-sepolia", new FailoverExhaustedError("source:ethereum-sepolia", []));
    } catch (error) {
      expect(error).toBeInstanceOf(AttestcoinError);
      expect((error as AttestcoinError).kind).toBe("SOURCE_RPC");
      expect((error as AttestcoinError).retriable).toBe(true);
    }
  });

  it("preserves an already-open circuit error", () => {
    const open = new AttestcoinError("CIRCUIT_OPEN", "open", { retriable: true });
    expect(() => normalizeRpcFailure("rpc", open)).toThrow(open);
  });
});
