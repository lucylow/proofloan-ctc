import { eq } from "drizzle-orm";
import type { CanonicalAttestcoinProofRecord } from "@shared/attestcoin";
import {
  attestcoinProofIdempotency,
  attestcoinProofRecords,
} from "../../drizzle/schema";
import { getDb } from "../db";

function asJson(value: unknown): string {
  return JSON.stringify(value);
}

function warnPersistenceFailure(label: string, error: unknown): void {
  console.warn(
    `[multichain] ${label} persistence failed`,
    error instanceof Error ? error.message : error,
  );
}

async function withProofPersistence(
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

export async function persistCanonicalProofRecord(
  record: CanonicalAttestcoinProofRecord,
): Promise<void> {
  await withProofPersistence("proof-record", async db => {
    await db.insert(attestcoinProofRecords).values({
      requestHash: record.requestHash,
      requestId: record.requestId,
      environment: record.environment,
      sourceChain: record.sourceChain,
      chainKey: record.chainKey,
      sourceBlock: record.sourceBlock,
      txHash: record.txHash,
      txIndex: record.txIndex,
      proofRoot: record.proofRoot,
      merkleProofHash: record.merkleProofHash,
      continuityProofHash: record.continuityProofHash,
      receiptStatus: record.receiptStatus,
      verificationStatus: record.verificationStatus,
      freshness: record.freshness,
      confirmations: record.confirmations,
      confirmationDepth: record.confirmationDepth,
      verificationBlock: record.verificationBlock,
      recordJson: asJson(record),
      verifiedAt: new Date(record.verifiedAt),
    }).onDuplicateKeyUpdate({
      set: {
        recordJson: asJson(record),
        verificationStatus: record.verificationStatus,
      },
    });

    await db.insert(attestcoinProofIdempotency).values({
      requestHash: record.requestHash,
      requestId: record.requestId,
      status: "committed",
      proofRoot: record.proofRoot,
    }).onDuplicateKeyUpdate({
      set: {
        status: "committed",
        proofRoot: record.proofRoot,
      },
    });
  });
}

export async function loadCanonicalProofRecord(requestHash: string) {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db
      .select()
      .from(attestcoinProofRecords)
      .where(eq(attestcoinProofRecords.requestHash, requestHash))
      .limit(1);
    const raw = rows[0]?.recordJson;
    if (typeof raw !== "string" || raw.trim() === "") return null;
    try {
      return JSON.parse(raw) as CanonicalAttestcoinProofRecord;
    } catch (error) {
      warnPersistenceFailure("proof-record-parse", error);
      return null;
    }
  } catch (error) {
    warnPersistenceFailure("proof-record-load", error);
    return null;
  }
}
