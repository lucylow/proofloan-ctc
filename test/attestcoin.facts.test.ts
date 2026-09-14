import { describe, expect, it } from "vitest";
import { computeEvidenceRoot, freshnessScore, normalizeFact } from "../server/attestcoin/facts";

describe("Attestcoin evidence aggregation", () => {
  const fact = normalizeFact({
    id: "vf_1",
    chain: "Ethereum Sepolia",
    sourceBlock: 100,
    txHash: "0x" + "a".repeat(64),
    eventType: "REPAYMENT",
    amount: "1,000 USDC",
    asset: "USDC",
    verificationBlock: 110,
    verifiedAt: new Date().toISOString(),
    observedAt: new Date().toISOString(),
    freshness: "Fresh",
    proofRoot: "0xproof",
    proofWorker: "Attestcoin proof worker",
  });

  it("computes deterministic evidence roots", () => {
    expect(computeEvidenceRoot([fact])).toBe(
      computeEvidenceRoot([fact]),
    );
  });

  it("scores fresh evidence at 100 percent", () => {
    expect(freshnessScore([fact])).toBe(100);
  });
});
