import { describe, expect, it } from "vitest";
import { getProofLoanErrorCode } from "@shared/proofloan";
import { AiError, isAiError, normalizeAiError, trpcCodeForAiError } from "./errors";
import { parseJsonObject } from "./json";
import { AI_MAX_BATCH } from "./constants";
import { estimateCost } from "./cost";
import { deriveAdvancedFeatures } from "./features";
import { aiUnderwritingService } from "./service";
import { FeedbackStore } from "./activeLearning";
import { enforceEvidenceMode } from "./blockchain/liveVsMockGuard";
import { requireVerifiedChain } from "./blockchain/chainSourceGuard";

describe("AI error normalization", () => {
  it("preserves typed AI errors", () => {
    const error = new AiError("VALIDATION", "Feature vector is invalid.");
    expect(normalizeAiError(error)).toBe(error);
    expect(isAiError(error)).toBe(true);
    expect(trpcCodeForAiError(error)).toBe("BAD_REQUEST");
  });

  it("maps timeouts and rate limits to retriable codes", () => {
    const aborted = new Error("The operation was aborted.");
    aborted.name = "AbortError";
    const timeout = normalizeAiError(aborted);
    expect(timeout.code).toBe("TIMEOUT");
    expect(timeout.retriable).toBe(true);
    expect(trpcCodeForAiError(timeout)).toBe("TIMEOUT");

    const limited = normalizeAiError(new Error("429 too many requests"));
    expect(limited.code).toBe("RATE_LIMITED");
    expect(trpcCodeForAiError(limited)).toBe("TOO_MANY_REQUESTS");
  });

  it("maps provider and unknown failures without leaking unstructured values", () => {
    const provider = normalizeAiError(new Error("OPENAI_API_KEY is not configured"));
    expect(provider.code).toBe("PROVIDER");
    expect(provider.retriable).toBe(true);
    expect(trpcCodeForAiError(provider)).toBe("TIMEOUT");

    const unknown = normalizeAiError("not-an-error");
    expect(unknown.code).toBe("UNKNOWN");
    expect(trpcCodeForAiError(unknown)).toBe("INTERNAL_SERVER_ERROR");
  });

  it("treats unlabeled mock evidence and unsupported chains as fail-closed AI errors", () => {
    expect(() => enforceEvidenceMode("mock", false)).toThrow(AiError);
    expect(normalizeAiError(new Error("Mock blockchain evidence is disabled")).code).toBe("POLICY");
    expect(trpcCodeForAiError(normalizeAiError(new Error("Mock blockchain evidence is disabled")))).toBe("BAD_REQUEST");

    expect(() => requireVerifiedChain("polygon-amoy", new Set(["ethereum-sepolia"]))).toThrow(/Unsupported chain/);
    const chain = normalizeAiError(new Error("Unsupported chain: polygon-amoy"));
    expect(chain.code).toBe("VALIDATION");
    expect(trpcCodeForAiError(chain)).toBe("BAD_REQUEST");
    expect(enforceEvidenceMode("verified", false)).toBe("verified");
  });

  it("classifies structured ProofLoan AI errors from the underwriting router", () => {
    expect(getProofLoanErrorCode("[PROOFLOAN_AI_ERROR] [AI:VALIDATION] Feature vector is invalid.")).toBe("PROOFLOAN_AI_ERROR");
  });
});

describe("AI payload sanitization", () => {
  it("rejects malformed JSON instead of throwing a raw SyntaxError", () => {
    expect(() => parseJsonObject("{not json")).toThrow(AiError);
    try {
      parseJsonObject("{not json");
    } catch (error) {
      expect(error).toMatchObject({ code: "SANITIZE", retriable: false });
    }
    expect(() => parseJsonObject("[]")).toThrow(/JSON object/);
    expect(parseJsonObject('{"pd30":0.1}')).toEqual({ pd30: 0.1 });
  });

  it("treats invalid evidence timestamps and amounts as zeroed contributions", () => {
    const derived = deriveAdvancedFeatures([
      {
        id: "bad",
        chain: "Ethereum Sepolia",
        sourceBlock: 1,
        txHash: "0x1",
        eventType: "REPAYMENT",
        amount: "not-a-number",
        asset: "USDC",
        verificationBlock: 2,
        verifiedAt: "not-a-date",
        observedAt: "also-not-a-date",
        freshness: "Fresh",
        proofRoot: "0xproof_bad",
        proofWorker: "Attestcoin proof worker",
      },
    ]);
    expect(derived.walletAgeDays).toBe(0);
    expect(derived.volume180d).toBe(0);
    expect(Number.isFinite(derived.leverageRatio)).toBe(true);
  });

  it("clamps invalid cost inputs instead of emitting NaN", () => {
    expect(estimateCost(Number.NaN, -4).usd).toBe(0);
    expect(estimateCost(1000, 500).usd).toBeGreaterThan(0);
  });
});

describe("AI service fail-closed handling", () => {
  it("rejects unbounded feature vectors as typed validation errors", async () => {
    await expect(aiUnderwritingService.decide({
      requestId: "invalid_features",
      walletAddress: "wallet",
      features: { repaymentCount: 1, latePayments: 0, leverageRatio: Number.POSITIVE_INFINITY, walletAgeDays: 1, volume7d: 1, volume30d: 1, volume180d: 1, evidenceCount: 1, freshnessScore: 1 },
      facts: [],
    })).rejects.toMatchObject({ name: "AiError", code: "VALIDATION" });
  });

  it("isolates invalid batch items instead of failing the entire batch", async () => {
    aiUnderwritingService.setStatus("disabled");
    try {
      const valid = {
        requestId: "batch_ok",
        walletAddress: "wallet",
        features: { repaymentCount: 1, latePayments: 0, leverageRatio: 0.4, walletAgeDays: 4, volume7d: 100, volume30d: 100, volume180d: 100, evidenceCount: 1, freshnessScore: 1 },
        facts: [{
          id: "a",
          chain: "Ethereum Sepolia" as const,
          sourceBlock: 10,
          txHash: "0x1",
          eventType: "REPAYMENT" as const,
          amount: "1250 USDC",
          asset: "USDC",
          verificationBlock: 12,
          verifiedAt: new Date().toISOString(),
          observedAt: new Date().toISOString(),
          freshness: "Fresh" as const,
          proofRoot: "0xproof_a",
          proofWorker: "Attestcoin proof worker" as const,
        }],
      };
      const result = await aiUnderwritingService.batch([
        valid,
        { ...valid, requestId: "batch_bad", features: { ...valid.features, freshnessScore: 2 } },
      ]);
      expect(result.envelopes).toHaveLength(1);
      expect(result.failures).toHaveLength(1);
      expect(result.failures?.[0]?.code).toBe("VALIDATION");
    } finally {
      aiUnderwritingService.setStatus("available");
    }
  });

  it("rejects oversized batches before inference", async () => {
    await expect(aiUnderwritingService.batch(Array.from({ length: AI_MAX_BATCH + 1 }, (_, index) => ({
      requestId: `too_big_${index}`,
      walletAddress: "wallet",
      features: { repaymentCount: 0, latePayments: 0, leverageRatio: 0, walletAgeDays: 0, volume7d: 0, volume30d: 0, volume180d: 0, evidenceCount: 0, freshnessScore: 0 },
      facts: [],
    })))).rejects.toMatchObject({ code: "BATCH" });
  });

  it("bounds active-learning feedback instead of growing without limit", () => {
    const store = new FeedbackStore();
    for (let index = 0; index < 1_005; index++) store.add({ requestId: `req_${index}`, label: "reviewed" });
    expect(store.list()).toHaveLength(1_000);
    store.add({ requestId: "   ", label: "accepted" });
    expect(store.list()).toHaveLength(1_000);
  });
});
