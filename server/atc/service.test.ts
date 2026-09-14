import { describe, expect, it } from "vitest";
import { loadAtcConfigFromEnv } from "./config";
import { AtcError } from "./errors";
import { ExternalProtocolAtcPaymentAdapter } from "./payment";
import { createAtcService } from "./service";
import { AttestorService } from "../attestors/service";
import { defaultAttestorPolicy } from "../attestors/policy";

const actionInput = {
  environment: "cc3-testnet" as const,
  sender: "0xproofloan",
  sourceChain: "creditcoin",
  destinationChain: "ethereum-sepolia",
  actionKind: "cross-chain-message" as const,
  payload: { applicationId: "PL-DEMO12345678", event: "credit-approved" },
  proofCount: 1,
  priority: "standard" as const,
};

describe("ATC service", () => {
  it("prepares and settles a paid action without minting ATC", async () => {
    const service = createAtcService();
    const prepared = await service.prepareAction({
      ...actionInput,
      idempotencyKey: "proofloan-action-12345678",
    });
    expect(prepared.quote.kind).toBe("action");
    expect(BigInt(prepared.quote.totalAtomic) > 0n).toBe(true);
    expect(prepared.payment.minting).toBe(false);
    expect(prepared.payment.adapter).toBe("simulated");
    const receipt = await service.settleAction({
      environment: "cc3-testnet",
      action: prepared.action,
      quote: prepared.quote,
      paymentReference: prepared.payment.paymentReference,
    });
    expect(receipt.status).toBe("settled");
    expect(receipt.mintedAtomic).toBe("0");
    const summary = service.summary();
    expect(summary.mintedAtomic).toBe("0");
    expect(summary.actionsSettled).toBe(1);
    expect(summary.paidVolumeAtomic).toBe(receipt.totalAtomic);
    expect(summary.claims.claimableAtomic).toBe(receipt.operatorRewardAtomic);
  });

  it("is idempotent for prepare and settle", async () => {
    const service = createAtcService();
    const first = await service.prepareAction({ ...actionInput, idempotencyKey: "proofloan-action-idempotent" });
    const second = await service.prepareAction({ ...actionInput, idempotencyKey: "proofloan-action-idempotent" });
    expect(second.action.actionId).toBe(first.action.actionId);
    expect(second.quote.quoteId).toBe(first.quote.quoteId);
    const settled = await service.settleAction({
      environment: "cc3-testnet",
      action: first.action,
      quote: first.quote,
      paymentReference: first.payment.paymentReference,
    });
    const replay = await service.settleAction({
      environment: "cc3-testnet",
      action: first.action,
      quote: first.quote,
      paymentReference: first.payment.paymentReference,
    });
    expect(replay.receiptId).toBe(settled.receiptId);
  });

  it("rejects a changed idempotency key for the same reservation fingerprint", async () => {
    const service = createAtcService();
    await service.prepareAction({ ...actionInput, idempotencyKey: "proofloan-action-original-key" });
    await expect(
      service.prepareAction({ ...actionInput, idempotencyKey: "proofloan-action-changed-key" }),
    ).rejects.toBeInstanceOf(AtcError);
  });

  it("rejects expired quotes before settlement", async () => {
    let now = new Date("2026-01-01T00:00:00.000Z");
    const service = createAtcService({ clock: { now: () => now } });
    const prepared = await service.prepareAction({
      ...actionInput,
      idempotencyKey: "proofloan-action-expired-quote",
    });
    now = new Date("2026-01-01T00:03:00.000Z");
    await expect(
      service.settleAction({
        environment: "cc3-testnet",
        action: prepared.action,
        quote: prepared.quote,
        paymentReference: prepared.payment.paymentReference,
      }),
    ).rejects.toMatchObject({ code: "EXPIRED" });
  });

  it("rejects destination mismatch and payload tampering", async () => {
    const service = createAtcService();
    const prepared = await service.prepareAction({
      ...actionInput,
      idempotencyKey: "proofloan-action-integrity-key",
    });
    await expect(
      service.settleAction({
        environment: "cc3-testnet",
        action: { ...prepared.action, destinationChain: "polygon-amoy" },
        quote: prepared.quote,
        paymentReference: prepared.payment.paymentReference,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(
      service.settleAction({
        environment: "cc3-testnet",
        action: { ...prepared.action, payload: { applicationId: "tampered" } },
        quote: prepared.quote,
        paymentReference: prepared.payment.paymentReference,
      }),
    ).rejects.toMatchObject({ code: "INTEGRITY" });
  });

  it("dry-runs without reserving a fee", () => {
    const service = createAtcService();
    const result = service.dryRunAction({
      ...actionInput,
      idempotencyKey: "proofloan-action-dry-run-key",
    });
    expect(result.valid).toBe(true);
    expect(result.reserved).toBe(false);
    expect(service.summary().actionsPrepared).toBe(0);
    expect(service.summary().reservedFees).toBe(0);
  });

  it("keeps the external payment adapter behind an explicit boundary", async () => {
    const adapter = new ExternalProtocolAtcPaymentAdapter(loadAtcConfigFromEnv());
    expect(() =>
      adapter.createPaymentInstruction({
        actionId: "atc_a_1",
        quoteId: "atc_q_1",
        amountAtomic: "1",
        destination: "atc:sink",
      }),
    ).toThrow(/not configured/);
    const external = createAtcService({
      config: { ...loadAtcConfigFromEnv(), mode: "external" },
    });
    await expect(
      external.prepareAction({ ...actionInput, idempotencyKey: "proofloan-action-external-key" }),
    ).rejects.toMatchObject({ code: "ADAPTER" });
  });

  it("requires Creditcoin on one side of a paid action", () => {
    const service = createAtcService();
    expect(() =>
      service.quoteAction({
        ...actionInput,
        sourceChain: "ethereum-sepolia",
        destinationChain: "polygon-amoy",
      }),
    ).toThrow(/Creditcoin/);
  });

  it("rejects unsupported chains as typed validation errors", () => {
    const service = createAtcService();
    try {
      service.quoteAction({
        ...actionInput,
        sourceChain: "solana",
        destinationChain: "creditcoin",
      });
      throw new Error("expected validation failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AtcError);
      expect((error as AtcError).code).toBe("VALIDATION");
    }
  });

  it("allocates paid-action rewards against Attestor weights", async () => {
    const service = createAtcService();
    const prepared = await service.prepareAction({
      ...actionInput,
      idempotencyKey: "proofloan-action-attestor-weights",
    });
    expect(prepared.operatorAllocations.every(item => item.operatorId.startsWith("attestor-demo-"))).toBe(true);
    const allocated = prepared.operatorAllocations.reduce((sum, item) => sum + BigInt(item.amountAtomic), 0n);
    expect(allocated).toBe(BigInt(prepared.quote.operatorRewardAtomic));
    const receipt = await service.settleAction({
      environment: "cc3-testnet",
      action: prepared.action,
      quote: prepared.quote,
      paymentReference: prepared.payment.paymentReference,
    });
    expect(receipt.status).toBe("settled");
  });

  it("rejects paid actions when the Attestor set is not operational", async () => {
    const service = createAtcService({
      attestors: new AttestorService({ attestors: [], policy: defaultAttestorPolicy }),
    });
    await expect(
      service.prepareAction({
        ...actionInput,
        idempotencyKey: "proofloan-action-no-attestors",
      }),
    ).rejects.toMatchObject({
      code: "POLICY",
      message: expect.stringMatching(/operational Attestor set/i),
    });
  });
});
