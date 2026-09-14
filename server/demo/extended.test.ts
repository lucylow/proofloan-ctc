import { describe, expect, it } from "vitest";
import { isMockEvidence } from "@shared/proofloan";
import {
  ALL_EXTENDED_CASES,
  assertExtendedCatalogValid,
  buildBatch,
  evaluateExtendedCase,
  factsForCase,
  getExtendedCase,
  listExtendedCases,
  materializeCase,
  searchExtendedCases,
  validateExtendedCatalog,
} from "./extended";

const NOW = Date.UTC(2026, 8, 13, 12);

describe("extended mock-data catalog", () => {
  it("contains 180 unique labeled cases covering the advertised scenario kinds", () => {
    const cases = listExtendedCases();
    expect(cases).toHaveLength(180);
    expect(ALL_EXTENDED_CASES).toHaveLength(180);
    expect(new Set(cases.map(item => item.id)).size).toBe(180);

    const kinds = new Set(cases.map(item => item.kind));
    for (const kind of [
      "happy-path",
      "freshness",
      "late-payment",
      "sparse-evidence",
      "cross-chain",
      "attestor-failure",
      "rpc-failure",
      "proof-builder-failure",
      "gas-pressure",
      "merkle-pressure",
      "ai-abstain",
      "riskguard-block",
      "operator-recovery",
      "reorg-recovery",
    ] as const) {
      expect(kinds.has(kind)).toBe(true);
    }

    const chains = new Set(cases.map(item => item.chain));
    expect(chains.has("Ethereum Sepolia")).toBe(true);
    expect(chains.has("Ethereum Mainnet")).toBe(true);
  });

  it("validates the catalog and enforces evidenceMode=mock on every fact", () => {
    expect(() => assertExtendedCatalogValid()).not.toThrow();
    const validation = validateExtendedCatalog();
    expect(validation.total).toBe(180);
    expect(validation.duplicateIds).toEqual([]);
    expect(validation.missingFacts).toEqual([]);
    expect(validation.unlabelledFacts).toEqual([]);

    for (const spec of listExtendedCases()) {
      const facts = factsForCase(spec, NOW);
      expect(facts.length).toBeGreaterThan(0);
      expect(facts.every(isMockEvidence)).toBe(true);
      expect(facts.every(fact => fact.source === "ProofLoan extended deterministic mock catalog")).toBe(true);
      expect(facts.every(fact => fact.txHash.startsWith("0x"))).toBe(true);
      expect(facts.every(fact => fact.proofRoot.startsWith("0x"))).toBe(true);
    }
  });

  it("is deterministic for the same case and timestamp", () => {
    const spec = getExtendedCase("extended-001");
    const first = materializeCase(spec, NOW);
    const second = materializeCase(spec, NOW);
    expect(first.walletAddress).toBe(second.walletAddress);
    expect(first.sourceTransactionHash).toBe(second.sourceTransactionHash);
    expect(first.facts.map(fact => fact.id)).toEqual(second.facts.map(fact => fact.id));
    expect(first.features).toEqual(second.features);
    expect(first.demoOnly).toBe(true);
  });

  it("searches and batches the catalog without network access", () => {
    const rpc = searchExtendedCases("rpc outage");
    expect(rpc.length).toBeGreaterThan(0);
    expect(rpc.every(item => item.kind === "rpc-failure" || item.description.includes("rpc") || item.tags.includes("rpc-failure"))).toBe(true);

    const batch = buildBatch(listExtendedCases(), NOW);
    expect(batch.total).toBe(180);
    expect(batch.generatedAt).toBe(new Date(NOW).toISOString());
    expect(Object.values(batch.countsByKind).reduce((sum, count) => sum + count, 0)).toBe(180);
  });

  it("evaluates abstention and RiskGuard blocks as labeled mock decisions", () => {
    const abstain = evaluateExtendedCase("extended-081", NOW);
    expect(abstain.status).toBe("Abstain");
    expect(abstain.policyStatus).toBe("Blocked");
    expect(abstain.reasons).toContain("INSUFFICIENT_CONFIDENCE");

    const blocked = evaluateExtendedCase("extended-012", NOW);
    expect(blocked.status).toBe("Blocked");
    expect(blocked.policyStatus).toBe("Blocked");

    const happy = evaluateExtendedCase("extended-001", NOW);
    expect(happy.status).toBe("Ready");
  });
});
