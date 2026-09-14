import { eq } from "drizzle-orm";
import {
  atcQuoteSchema,
  type AtcActionReceipt,
  type AtcFeeRecord,
  type AtcOperatorReward,
  type AtcQuote,
} from "@shared/atc";
import {
  atcActionReceipts,
  atcFeeLedger,
  atcOperatorRewards,
  atcQuotes,
} from "../../drizzle/schema";
import { getDb } from "../db";

function asJson(value: unknown): string {
  return JSON.stringify(value);
}

function warnPersistenceFailure(label: string, error: unknown): void {
  console.warn(
    `[ATC] ${label} persistence failed`,
    error instanceof Error ? error.message : error,
  );
}

async function withAtcPersistence(
  label: string,
  work: (db: NonNullable<Awaited<ReturnType<typeof getDb>>>) => Promise<void>,
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await work(db);
  } catch (error) {
    warnPersistenceFailure(label, error);
  }
}

export function parsePersistedAtcQuote(raw: unknown): AtcQuote | null {
  if (typeof raw !== "string" || raw.trim().length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = atcQuoteSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function persistAtcQuote(quote: AtcQuote): Promise<void> {
  await withAtcPersistence("quote", async db => {
    await db.insert(atcQuotes).values({
      quoteId: quote.quoteId,
      kind: quote.kind,
      environment: quote.environment,
      sender: quote.sender,
      sourceChain: quote.sourceChain,
      destinationChain: quote.destinationChain,
      actionKind: quote.actionKind,
      payloadHash: quote.payloadHash,
      totalAtomic: quote.totalAtomic,
      operatorRewardAtomic: quote.operatorRewardAtomic,
      burnAtomic: quote.burnAtomic,
      treasuryAtomic: quote.treasuryAtomic,
      quoteJson: asJson(quote),
      expiresAt: new Date(quote.expiresAt),
    }).onDuplicateKeyUpdate({
      set: {
        quoteJson: asJson(quote),
        totalAtomic: quote.totalAtomic,
      },
    });
  });
}

export async function persistAtcFee(fee: AtcFeeRecord): Promise<void> {
  await withAtcPersistence("fee", async db => {
    await db.insert(atcFeeLedger).values({
      feeId: fee.feeId,
      quoteId: fee.quoteId,
      actionId: fee.actionId,
      idempotencyKey: fee.idempotencyKey,
      requestFingerprint: fee.requestFingerprint,
      status: fee.status,
      totalAtomic: fee.totalAtomic,
      operatorRewardAtomic: fee.operatorRewardAtomic,
      burnAtomic: fee.burnAtomic,
      treasuryAtomic: fee.treasuryAtomic,
      paymentReference: fee.paymentReference,
      protocolReference: fee.protocolReference,
      feeJson: asJson(fee),
      settledAt: fee.settledAt ? new Date(fee.settledAt) : null,
    }).onDuplicateKeyUpdate({
      set: {
        status: fee.status,
        paymentReference: fee.paymentReference,
        protocolReference: fee.protocolReference,
        feeJson: asJson(fee),
        settledAt: fee.settledAt ? new Date(fee.settledAt) : null,
      },
    });
  });
}

export async function persistAtcRewards(rewards: AtcOperatorReward[]): Promise<void> {
  if (rewards.length === 0) return;
  await withAtcPersistence("rewards", async db => {
    for (const reward of rewards) {
      await db.insert(atcOperatorRewards).values({
        rewardId: reward.rewardId,
        feeId: reward.feeId,
        actionId: reward.actionId,
        operatorId: reward.operatorId,
        amountAtomic: reward.amountAtomic,
        status: reward.status,
        rewardJson: asJson(reward),
        claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : null,
      }).onDuplicateKeyUpdate({
        set: {
          status: reward.status,
          rewardJson: asJson(reward),
          claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : null,
        },
      });
    }
  });
}

export async function persistAtcReceipt(receipt: AtcActionReceipt): Promise<void> {
  await withAtcPersistence("receipt", async db => {
    await db.insert(atcActionReceipts).values({
      receiptId: receipt.receiptId,
      actionId: receipt.actionId,
      quoteId: receipt.quoteId,
      feeId: receipt.feeId,
      status: receipt.status,
      paymentReference: receipt.paymentReference,
      protocolReference: receipt.protocolReference,
      totalAtomic: receipt.totalAtomic,
      receiptJson: asJson(receipt),
      settledAt: receipt.settledAt ? new Date(receipt.settledAt) : null,
    }).onDuplicateKeyUpdate({
      set: {
        status: receipt.status,
        paymentReference: receipt.paymentReference,
        protocolReference: receipt.protocolReference,
        receiptJson: asJson(receipt),
        settledAt: receipt.settledAt ? new Date(receipt.settledAt) : null,
      },
    });
  });
}

export async function loadPersistedAtcQuote(quoteId: string): Promise<AtcQuote | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(atcQuotes).where(eq(atcQuotes.quoteId, quoteId)).limit(1);
    const row = rows[0];
    if (!row?.quoteJson) return null;
    return parsePersistedAtcQuote(row.quoteJson);
  } catch (error) {
    warnPersistenceFailure("quote load", error);
    return null;
  }
}
