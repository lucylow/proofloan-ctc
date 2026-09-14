import { describe, expect, it } from "vitest";
import {
  computeCrossChainDigest,
  computeEvidenceRoot,
  freshnessScore,
  normalizeEvidence,
  previewFactsFor,
} from "./facts";
import { normalizeFact } from "../attestcoin/facts";

describe("multi-chain evidence normalization", () => {
  it("keeps preview chronology consistent across registered chains", () => {
    for (const chain of ["Ethereum Sepolia", "Ethereum Mainnet", "Polygon Amoy"] as const) {
      const facts = previewFactsFor("0xpreview-wallet", chain);
      expect(facts.every(fact => fact.verificationBlock >= fact.sourceBlock)).toBe(true);
      expect(facts.every(fact => fact.chain === chain)).toBe(true);
    }
  });

  it("computes deterministic evidence roots and cross-chain digests", () => {
    const facts = previewFactsFor("0xpreview-wallet", "Ethereum Sepolia").map(fact =>
      normalizeFact(fact),
    );
    expect(computeEvidenceRoot(facts)).toBe(computeEvidenceRoot(facts));
    expect(computeCrossChainDigest(facts)).toBe(computeCrossChainDigest(facts));
    expect(freshnessScore(facts)).toBeGreaterThan(0);

    const normalized = normalizeEvidence(facts);
    expect(normalized.chains).toContain("Ethereum Sepolia");
    expect(normalized.digest.startsWith("0x")).toBe(true);
  });
});
