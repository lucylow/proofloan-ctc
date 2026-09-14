import { describe, expect, it } from "vitest";
import { aiUnderwritingService, DEFAULT_MODEL_PROFILE } from "./service";
import { baselineScore } from "./baseline";
import { deriveAdvancedFeatures } from "./features";

const facts = [
  { id:"a", chain:"Ethereum Sepolia" as const, sourceBlock:10, txHash:"0x1", eventType:"REPAYMENT" as const, amount:"1250 USDC", asset:"USDC", verificationBlock:12, verifiedAt:new Date().toISOString(), observedAt:new Date().toISOString(), freshness:"Fresh" as const, proofRoot:"0xproof_a", proofWorker:"Attestcoin proof worker" as const },
  { id:"b", chain:"Ethereum Sepolia" as const, sourceBlock:11, txHash:"0x2", eventType:"COLLATERAL_DEPOSIT" as const, amount:"2800 USDC", asset:"USDC", verificationBlock:13, verifiedAt:new Date().toISOString(), observedAt:new Date().toISOString(), freshness:"Fresh" as const, proofRoot:"0xproof_b", proofWorker:"Attestcoin proof worker" as const },
];
const features = { repaymentCount:1, latePayments:0, leverageRatio:.45, walletAgeDays:4, volume7d:4050, volume30d:4050, volume180d:4050, evidenceCount:2, freshnessScore:1 };

describe("advanced AI underwriting", () => {
  it("produces bounded deterministic baseline", () => { const d=baselineScore(features,facts); expect(d.pd30).toBeGreaterThanOrEqual(0); expect(d.pd90).toBeGreaterThanOrEqual(d.pd30); expect(d.decisionHash).toHaveLength(24); });
  it("derives advanced features", () => { const f=deriveAdvancedFeatures(facts); expect(f.featureFingerprint).toHaveLength(24); expect(f.chainDiversity).toBeGreaterThan(0); });
  it("abstains when evidence is sparse", async () => {
    aiUnderwritingService.setStatus("disabled");
    try {
      const result = await aiUnderwritingService.decide({ requestId: "test_sparse", walletAddress: "w", features: { ...features, evidenceCount: 0, freshnessScore: 0 }, facts: [] });
      expect(result.abstained).toBe(true);
      expect(result.decision.pd90).toBeGreaterThanOrEqual(result.decision.pd30);
    } finally {
      aiUnderwritingService.setStatus("available");
    }
  });
  it("exposes model profile", () => { const p=aiUnderwritingService.getProfile(); expect(p.id).toBe(DEFAULT_MODEL_PROFILE.id); });
});
