import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { POLYGON_AMOY_LIVE_PROOF_REJECTION } from "@shared/multichain";
import { resetEnvironmentCache } from "./multichain/environment";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Attestcoin protocol router", () => {
  beforeEach(() => {
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
    resetEnvironmentCache();
  });
  it("keeps preview bundles visibly unverified", async () => {
    const caller = appRouter.createCaller(createContext());
    const bundle = await caller.attestcoin.preview({
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      sourceChain: "Ethereum Sepolia",
    });

    expect(bundle.receipt.mode).toBe("preview");
    expect(bundle.receipt.verified).toBe(false);
    expect(bundle.facts.every(fact => !fact.sourceVerified)).toBe(true);
  });

  it("keeps Polygon Amoy preview available while labeling it experimental", async () => {
    const caller = appRouter.createCaller(createContext());
    const bundle = await caller.attestcoin.preview({
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      sourceChain: "Polygon Amoy",
    });

    expect(bundle.receipt.mode).toBe("preview");
    expect(bundle.receipt.warnings.join(" ")).toMatch(/experimental/i);
  });

  it("rejects live Polygon Amoy proofs with the official-chainkey explanation", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.attestcoin.prove({
        txHash: `0x${"ab".repeat(32)}`,
        sourceChain: "Polygon Amoy",
        allowPreviewFallback: false,
        forceRefresh: true,
      }),
    ).rejects.toThrow(POLYGON_AMOY_LIVE_PROOF_REJECTION);
  });

  it("exposes the registry-driven environment snapshot", async () => {
    const caller = appRouter.createCaller(createContext());
    const snapshot = await caller.attestcoin.environment();
    expect(snapshot.environment).toBe("cc3-testnet");
    expect(snapshot.capabilities.some(row => row.name === "Ethereum Sepolia" && row.chainKey === 1)).toBe(true);
    expect(snapshot.capabilities.some(row => row.name === "Polygon Amoy" && row.liveProof === false)).toBe(true);
  });

  it("exposes ATC fee policy, free reads, and paid-action settlement", async () => {
    const caller = appRouter.createCaller(createContext());
    const policy = await caller.attestcoin.feePolicy();
    expect(policy.operatorRewardBps + policy.burnBps + policy.treasuryBps).toBe(10_000);
    expect(policy.disclaimer).toMatch(/not official Attestcoin/i);

    const readQuote = await caller.attestcoin.freeReadQuote({
      environment: "cc3-testnet",
      actionKind: "cross-chain-message",
    });
    expect(readQuote.totalAtomic).toBe("0");

    const prepared = await caller.attestcoin.prepareAction({
      environment: "cc3-testnet",
      sender: "0xproofloan",
      sourceChain: "creditcoin",
      destinationChain: "ethereum-sepolia",
      actionKind: "cross-chain-message",
      payload: { applicationId: "PL-DEMO12345678", event: "credit-approved" },
      proofCount: 1,
      priority: "standard",
      idempotencyKey: "proofloan-router-action-0001",
    });
    expect(BigInt(prepared.quote.totalAtomic) > 0n).toBe(true);

    const receipt = await caller.attestcoin.settleAction({
      environment: "cc3-testnet",
      action: prepared.action,
      quote: prepared.quote,
      paymentReference: prepared.payment.paymentReference,
    });
    expect(receipt.status).toBe("settled");
    expect(receipt.mintedAtomic).toBe("0");

    const capabilities = await caller.attestcoin.atcCapabilities();
    expect(capabilities.minting).toBe(false);
    expect(capabilities.freeReads).toBe(true);
  });

  it("exposes the production catalog, ASC model, and operator diagnostics", async () => {
    const caller = appRouter.createCaller(createContext());
    const catalog = await caller.attestcoin.catalog();
    expect(catalog.ascModel.requireReceiptStatus).toBe("0x1");
    expect(catalog.costModel.crossChainReads).toBe("free");
    expect(catalog.sourceChains.some(chain => chain.name === "Polygon Amoy" && chain.experimental)).toBe(true);

    const diagnostics = await caller.attestcoin.operatorDiagnostics();
    expect(diagnostics.adapters.receiptValidation).toContain("receipt.ts");
    expect(diagnostics.catalog.precompiles.blockProver).toMatch(/0FD2$/i);
    expect(diagnostics.atc.mintingEnabled).toBe(false);
  });

  it("maps unsupported ATC chains to a client-safe validation error", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.attestcoin.quoteActionFee({
        environment: "cc3-testnet",
        sender: "0xproofloan",
        sourceChain: "solana",
        destinationChain: "creditcoin",
        actionKind: "cross-chain-message",
        payload: { applicationId: "PL-DEMO12345678" },
        proofCount: 1,
        priority: "standard",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringMatching(/Unsupported ATC chain/i),
    });
  });

  it("rejects prove requests that are not live transaction hashes", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.attestcoin.prove({
        txHash: "0xabc",
        sourceChain: "Ethereum Sepolia",
        allowPreviewFallback: false,
        forceRefresh: false,
      } as never),
    ).rejects.toBeTruthy();
  });
});
