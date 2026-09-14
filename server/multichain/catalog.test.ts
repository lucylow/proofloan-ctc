import { describe, expect, it } from "vitest";
import { getPublicChainCatalog } from "./catalog";
import { parseEnvironmentConfig, parseSourceChainConfig } from "./configSchema";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { featureVectorAdapter } from "./features";
import { creditcoinExecutionAdapter } from "./execution";
import { PRODUCTION_ADAPTER_BOUNDARIES } from "./adapters";
import { buildVerifiedFacts } from "../underwriting";
import { resetEnvironmentCache } from "./environment";

describe("production catalog, config, and adapter boundaries", () => {
  it("exposes official chainkeys, experimental Amoy, and the documented ASC model", () => {
    resetEnvironmentCache();
    const catalog = getPublicChainCatalog("cc3-testnet");
    expect(catalog.ascModel.blockProverPrecompile).toBe(BLOCK_PROVER_PRECOMPILE);
    expect(catalog.ascModel.requireReceiptStatus).toBe("0x1");
    expect(catalog.costModel.crossChainReads).toBe("free");
    expect(catalog.costModel.crossChainActions).toBe("atc-paid");
    expect(catalog.costModel.minting).toBe(false);

    const sepolia = catalog.sourceChains.find(chain => chain.name === "Ethereum Sepolia");
    const amoy = catalog.sourceChains.find(chain => chain.name === "Polygon Amoy");
    expect(sepolia?.chainKey).toBe(1);
    expect(sepolia?.confirmationDepth).toBe(32);
    expect(sepolia?.liveProofEnabled).toBe(true);
    expect(amoy?.experimental).toBe(true);
    expect(amoy?.chainKey).toBeNull();
    expect(amoy?.liveProofEnabled).toBe(false);

    expect(parseEnvironmentConfig(catalog.environment).id).toBe("cc3-testnet");
    expect(parseSourceChainConfig(sepolia!).confirmationDepth).toBe(32);
  });

  it("does not invent a Sepolia chainkey on CC3 Mainnet", () => {
    const catalog = getPublicChainCatalog("cc3-mainnet");
    const sepolia = catalog.sourceChains.find(chain => chain.name === "Ethereum Sepolia");
    expect(sepolia?.chainKey).toBeNull();
    expect(sepolia?.liveProofEnabled).toBe(false);
    expect(catalog.officialBindings["ethereum-mainnet"]?.chainKey).toBe(1);
  });

  it("keeps FeatureVector creation compatible with underwriting", () => {
    const facts = buildVerifiedFacts("0x71C7...9A2F", "Ethereum Sepolia");
    const features = featureVectorAdapter.fromFacts(facts, Date.parse("2026-09-13T08:00:00.000Z"));
    expect(features.evidenceCount).toBe(facts.length);
    expect(features.repaymentCount).toBeGreaterThan(0);
    expect(PRODUCTION_ADAPTER_BOUNDARIES.featureVector).toContain("underwriting");
  });

  it("keeps free cross-chain reads at zero ATC while paid actions settle a fee", async () => {
    const read = creditcoinExecutionAdapter.quoteFreeRead({
      environment: "cc3-testnet",
      actionKind: "cross-chain-message",
    });
    expect(read.totalAtomic).toBe("0");
    expect(read.kind).toBe("read");

    const prepared = await creditcoinExecutionAdapter.preparePaidAction({
      environment: "cc3-testnet",
      sender: "0xproofloan",
      sourceChain: "creditcoin",
      destinationChain: "ethereum-sepolia",
      actionKind: "credit-execution",
      payload: { applicationId: "PL-DEMO12345678", event: "credit-approved" },
      proofCount: 1,
      priority: "standard",
      idempotencyKey: "proofloan-multichain-paid-0001",
    });
    expect(BigInt(prepared.quote.totalAtomic) > 0n).toBe(true);

    const settled = await creditcoinExecutionAdapter.settlePaidAction({
      environment: "cc3-testnet",
      action: prepared.action,
      quote: prepared.quote,
      paymentReference: prepared.payment.paymentReference,
    });
    expect(settled.status).toBe("settled");
    expect(settled.mintedAtomic).toBe("0");
  });
});
