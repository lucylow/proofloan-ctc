import { describe, expect, it } from "vitest";
import { MOCK_NOW_ISO, MOCK_SEED, PRIMARY_APPLICATION_ID } from "../constants";
import { createMockDataset } from "../createMockDataset";
import { toDemoDataset } from "../toDemo";
import { validateDemoData } from "@/demo/validation/demoSchema";
import { inspectDemoReferences } from "@/demo/validation/referenceIntegrity";

describe("mock Attestcoin dataset", () => {
  it("is deterministic for the same seed and scenario", () => {
    const first = createMockDataset("hero", MOCK_SEED);
    const second = createMockDataset("hero", MOCK_SEED);
    expect(first).toEqual(second);
    expect(first.generatedAt).toBe(MOCK_NOW_ISO);
    expect(first.presentationOnly).toBe(true);
  });

  it("keeps the primary application id used by existing demo links", () => {
    const dataset = createMockDataset("hero");
    expect(dataset.applications.some(item => item.id === PRIMARY_APPLICATION_ID)).toBe(true);
    expect(dataset.wallets.some(item => item.id === "wallet-primary")).toBe(true);
  });

  it("returns an empty presentation set for the empty scenario", () => {
    const dataset = createMockDataset("empty");
    expect(dataset.applications).toEqual([]);
    expect(dataset.wallets).toEqual([]);
    expect(dataset.facts).toEqual([]);
    expect(dataset.proofRequests).toEqual([]);
    expect(dataset.health.creditcoinRpc).toBe("offline");
  });

  it("covers five source chains in multi-chain and judge scenarios", () => {
    for (const scenario of ["multi-chain", "judge", "cross-chain-wealth"] as const) {
      const dataset = createMockDataset(scenario);
      const chains = new Set(dataset.transactions.map(item => item.chainId));
      expect(chains.has("ethereum-sepolia")).toBe(true);
      expect(chains.has("polygon-amoy")).toBe(true);
      expect(chains.has("arbitrum-sepolia")).toBe(true);
      expect(chains.has("base-sepolia")).toBe(true);
      expect(chains.has("optimism-sepolia")).toBe(true);
    }
  });

  it("does not mark preview, delayed, or rejected facts as live-verified", () => {
    for (const scenario of ["proof-rejected", "partial-attestation", "proof-delay"] as const) {
      const dataset = createMockDataset(scenario);
      const unverified = dataset.facts.filter(fact => !fact.sourceVerified);
      expect(unverified.length).toBeGreaterThan(0);
      expect(dataset.facts.every(fact => fact.sourceVerified === (dataset.proofRequests.find(proof => proof.txHash === fact.txHash)?.status === "verified"))).toBe(true);
    }
  });

  it("maps every scenario into a valid demo dataset", () => {
    const dataset = createMockDataset("hero");
    const mapped = toDemoDataset(dataset);
    const validated = validateDemoData(mapped);
    expect(validated.ok).toBe(true);
    expect(inspectDemoReferences(mapped)).toEqual([]);
    expect(mapped.applications[0]?.leverageRatio).toBeGreaterThanOrEqual(0);
    expect(mapped.applications[0]?.leverageRatio).toBeLessThanOrEqual(1);
    expect(mapped.applications[0]?.loanToValue).toBeGreaterThanOrEqual(0);
    expect(mapped.applications[0]?.loanToValue).toBeLessThanOrEqual(1);
  });
});
