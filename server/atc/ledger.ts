import { randomUUID } from "node:crypto";
import type {
  AtcActionEnvelope,
  AtcActionReceipt,
  AtcFeeRecord,
  AtcOperatorAllocation,
  AtcOperatorReward,
  AtcQuote,
} from "@shared/atc";
import { AtcError } from "./errors";

type PreparedEntry = {
  fingerprint: string;
  quote: AtcQuote;
  action: AtcActionEnvelope;
  fee: AtcFeeRecord;
  allocations: AtcOperatorAllocation[];
  receipt: AtcActionReceipt;
};

export class AtcLedger {
  private readonly quotes = new Map<string, AtcQuote>();
  private readonly prepared = new Map<string, PreparedEntry>();
  private readonly feesByAction = new Map<string, AtcFeeRecord>();
  private readonly rewards = new Map<string, AtcOperatorReward[]>();
  private nonce = 0n;

  nextNonce(): string {
    this.nonce += 1n;
    return this.nonce.toString(10);
  }

  putQuote(quote: AtcQuote): void {
    this.quotes.set(quote.quoteId, quote);
  }

  getQuote(quoteId: string): AtcQuote | undefined {
    return this.quotes.get(quoteId);
  }

  getPrepared(idempotencyKey: string): PreparedEntry | undefined {
    return this.prepared.get(idempotencyKey);
  }

  getFeeByAction(actionId: string): AtcFeeRecord | undefined {
    return this.feesByAction.get(actionId);
  }

  reserve(input: {
    fingerprint: string;
    idempotencyKey: string;
    quote: AtcQuote;
    action: AtcActionEnvelope;
    allocations: AtcOperatorAllocation[];
  }): PreparedEntry {
    const existing = this.prepared.get(input.idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== input.fingerprint) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation.",
        );
      }
      return existing;
    }
    for (const entry of this.prepared.values()) {
      if (entry.fingerprint === input.fingerprint && entry.fee.idempotencyKey !== input.idempotencyKey) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation.",
        );
      }
    }
    const feeId = `atc_f_${randomUUID().replaceAll("-", "")}`;
    const now = new Date().toISOString();
    const fee: AtcFeeRecord = {
      feeId,
      quoteId: input.quote.quoteId,
      actionId: input.action.actionId,
      idempotencyKey: input.idempotencyKey,
      requestFingerprint: input.fingerprint,
      status: "reserved",
      totalAtomic: input.quote.totalAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      burnAtomic: input.quote.burnAtomic,
      treasuryAtomic: input.quote.treasuryAtomic,
      createdAt: now,
    };
    const receipt: AtcActionReceipt = {
      receiptId: `atc_r_${randomUUID().replaceAll("-", "")}`,
      actionId: input.action.actionId,
      quoteId: input.quote.quoteId,
      feeId,
      status: "prepared",
      paymentReference: "",
      totalAtomic: input.quote.totalAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      burnAtomic: input.quote.burnAtomic,
      treasuryAtomic: input.quote.treasuryAtomic,
      mintedAtomic: "0",
      createdAt: now,
    };
    const entry: PreparedEntry = {
      fingerprint: input.fingerprint,
      quote: input.quote,
      action: input.action,
      fee,
      allocations: input.allocations,
      receipt,
    };
    this.quotes.set(input.quote.quoteId, input.quote);
    this.prepared.set(input.idempotencyKey, entry);
    this.feesByAction.set(input.action.actionId, fee);
    return entry;
  }

  settle(input: {
    actionId: string;
    paymentReference: string;
    protocolReference?: string;
    rewards: AtcOperatorReward[];
  }): AtcActionReceipt {
    const fee = this.feesByAction.get(input.actionId);
    const entry = [...this.prepared.values()].find(item => item.action.actionId === input.actionId);
    if (!fee || !entry) {
      throw new AtcError("VALIDATION", "ATC fee reservation was not found for settlement.");
    }
    if (fee.status === "settled" && entry.receipt.status === "settled") {
      if (entry.receipt.paymentReference !== input.paymentReference) {
        throw new AtcError("IDEMPOTENCY", "ATC settlement already exists for a different payment reference.");
      }
      return entry.receipt;
    }
    if (fee.status !== "reserved") {
      throw new AtcError("VALIDATION", `ATC fee cannot be settled from status ${fee.status}.`);
    }
    const settledAt = new Date().toISOString();
    fee.status = "settled";
    fee.paymentReference = input.paymentReference;
    fee.protocolReference = input.protocolReference;
    fee.settledAt = settledAt;
    entry.receipt = {
      ...entry.receipt,
      status: "settled",
      paymentReference: input.paymentReference,
      protocolReference: input.protocolReference,
      settledAt,
    };
    this.rewards.set(fee.feeId, input.rewards);
    return entry.receipt;
  }

  getRewards(feeId: string): AtcOperatorReward[] {
    return this.rewards.get(feeId) ?? [];
  }

  listRewards(): AtcOperatorReward[] {
    return [...this.rewards.values()].flat();
  }

  replaceRewards(feeId: string, rewards: AtcOperatorReward[]): void {
    this.rewards.set(feeId, rewards);
  }
}
