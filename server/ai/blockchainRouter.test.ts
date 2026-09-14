import { describe, expect, it } from "vitest";
import { aiRouter } from "./router";
import type { TrpcContext } from "../_core/context";
import { EMPTY_BLOCKCHAIN_FEATURES } from "./blockchain/coerceFeatures";
import { featureContextFromVerifiedFacts } from "./blockchain/fromVerifiedFacts";
import { buildAiBlockchainContext } from "./blockchain/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const now = Date.now();
const verifiedObservation = {
  chainId: "ethereum-sepolia",
  blockNumber: 1,
  txHash: "0xabc",
  direction: "out" as const,
  asset: "USDC",
  amount: "1250",
  timestampMs: now,
  verified: true,
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
};

describe("ai.blockchain router", () => {
  it("exposes feature, score, fingerprint, route, walletRisk, and promptContext endpoints", async () => {
    const caller = aiRouter.createCaller(createContext());
    const features = await caller.blockchain.features({
      nowMs: now,
      observations: [verifiedObservation],
      events: [],
    });
    expect(features.proofCoverage).toBeGreaterThan(0);
    expect(features.proofCoverage).toBeLessThanOrEqual(1);

    const score = await caller.blockchain.score({ features });
    expect(score.abstain).toBe(false);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(1);

    const fingerprint = await caller.blockchain.fingerprint({ features });
    expect(fingerprint).toHaveLength(64);

    const route = await caller.blockchain.route({ features });
    expect(["fast", "deep", "abstain"]).toContain(route);

    const risk = await caller.blockchain.walletRisk({ features });
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(1);

    const prompt = await caller.blockchain.promptContext({ features });
    expect(prompt.instruction).toMatch(/verified blockchain evidence/i);
  });

  it("refuses unlabeled mock evidence unless allowMock is set", async () => {
    const caller = aiRouter.createCaller(createContext());
    await expect(caller.blockchain.features({
      nowMs: now,
      observations: [{ ...verifiedObservation, verified: false }],
      evidenceMode: "mock",
    })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringMatching(/Mock blockchain evidence is disabled/i),
    });

    const allowed = await caller.blockchain.features({
      nowMs: now,
      observations: [{ ...verifiedObservation, verified: false }],
      evidenceMode: "mock",
      allowMock: true,
    });
    expect(allowed.proofCoverage).toBe(0);
  });

  it("abstains when proof coverage is missing", async () => {
    const caller = aiRouter.createCaller(createContext());
    const score = await caller.blockchain.score({ features: EMPTY_BLOCKCHAIN_FEATURES });
    expect(score.abstain).toBe(true);
    expect(score.reasons).toContain("LOW_PROOF_COVERAGE");
  });

  it("rejects malformed blockchain feature payloads", async () => {
    const caller = aiRouter.createCaller(createContext());
    await expect(caller.blockchain.score({ features: { proofCoverage: Number.NaN } as never })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe("Attestcoin-verified fact adapter", () => {
  it("maps verified facts into blockchain observations without inventing proofs", () => {
    const facts = [{
      id: "vf_1",
      chain: "Ethereum Sepolia" as const,
      sourceBlock: 10,
      txHash: "0x1",
      eventType: "REPAYMENT" as const,
      amount: "1,250 USDC",
      asset: "USDC",
      verificationBlock: 12,
      verifiedAt: new Date(now).toISOString(),
      observedAt: new Date(now).toISOString(),
      freshness: "Fresh" as const,
      proofRoot: "0xproof_a",
      proofWorker: "Attestcoin proof worker" as const,
    }];
    const context = featureContextFromVerifiedFacts(facts, now, "0xabc");
    expect(context.observations[0]?.verified).toBe(true);
    expect(context.observations[0]?.amount).toBe("1250");
    expect(context.events[0]?.proofRoot).toBe("0xproof_a");
  });

  it("does not treat mock facts as Attestcoin-verified evidence", () => {
    const facts = [{
      id: "vf_mock",
      chain: "Ethereum Sepolia" as const,
      sourceBlock: 10,
      txHash: "0x1",
      eventType: "REPAYMENT" as const,
      amount: "1250 USDC",
      asset: "USDC",
      verificationBlock: 12,
      verifiedAt: new Date(now).toISOString(),
      observedAt: new Date(now).toISOString(),
      freshness: "Fresh" as const,
      proofRoot: "0xproof_mock",
      proofWorker: "Attestcoin proof worker" as const,
      evidenceMode: "mock" as const,
    }];
    const context = buildAiBlockchainContext(facts, now, "0xabc");
    expect(context.evidenceMode).toBe("mock");
    expect(context.features.proofCoverage).toBe(0);
    expect(context.score.abstain).toBe(true);
    expect(context.promptContext.instruction).toMatch(/mock/i);
  });
});
