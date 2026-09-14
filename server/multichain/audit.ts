import type { CanonicalAttestcoinProofRecord } from "@shared/attestcoin";
import { hashValue } from "../underwriting";

export type AttestcoinAuditRecord = {
  event: "proof-verified" | "proof-rejected" | "free-read" | "paid-action";
  requestHash: string;
  environment: string;
  chainKey: number | null;
  sourceChain: string;
  sourceBlock?: number;
  txHash?: string;
  txIndex?: number;
  receiptStatus?: string;
  proofRoot?: string;
  verificationStatus: string;
  at: string;
  hash: string;
  detail?: string;
};

function seal(record: Omit<AttestcoinAuditRecord, "hash">): AttestcoinAuditRecord {
  return {
    ...record,
    hash: `0x${hashValue({
      namespace: "proofloan:attestcoin:audit:v1",
      ...record,
    })}`,
  };
}

export function auditVerifiedProof(record: CanonicalAttestcoinProofRecord): AttestcoinAuditRecord {
  return seal({
    event: "proof-verified",
    requestHash: record.requestHash,
    environment: record.environment,
    chainKey: record.chainKey,
    sourceChain: record.sourceChain,
    sourceBlock: record.sourceBlock,
    txHash: record.txHash,
    txIndex: record.txIndex,
    receiptStatus: record.receiptStatus,
    proofRoot: record.proofRoot,
    verificationStatus: record.verificationStatus,
    at: record.verifiedAt,
  });
}

export function auditRejectedProof(input: {
  requestHash: string;
  environment: string;
  sourceChain: string;
  chainKey: number | null;
  txHash?: string;
  kind: string;
  message: string;
  nowMs?: number;
}): AttestcoinAuditRecord {
  return seal({
    event: "proof-rejected",
    requestHash: input.requestHash,
    environment: input.environment,
    chainKey: input.chainKey,
    sourceChain: input.sourceChain,
    txHash: input.txHash,
    verificationStatus: "failed",
    at: new Date(input.nowMs ?? Date.now()).toISOString(),
    detail: `${input.kind}: ${input.message}`,
  });
}

export function auditCostClass(input: {
  event: "free-read" | "paid-action";
  requestHash: string;
  environment: string;
  sourceChain: string;
  chainKey?: number | null;
  nowMs?: number;
}): AttestcoinAuditRecord {
  return seal({
    event: input.event,
    requestHash: input.requestHash,
    environment: input.environment,
    chainKey: input.chainKey ?? null,
    sourceChain: input.sourceChain,
    verificationStatus: input.event === "free-read" ? "preview" : "verified",
    at: new Date(input.nowMs ?? Date.now()).toISOString(),
  });
}
