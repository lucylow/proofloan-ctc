import { AttestcoinError } from "../attestcoin/errors";
import type { CanonicalAttestcoinProofRecord } from "@shared/attestcoin";

export type ProofIdempotencyRecord =
  | {
      status: "pending";
      requestHash: string;
      requestId: string;
      startedAt: string;
    }
  | {
      status: "committed";
      requestHash: string;
      requestId: string;
      record: CanonicalAttestcoinProofRecord;
      committedAt: string;
    }
  | {
      status: "failed";
      requestHash: string;
      requestId: string;
      kind: string;
      message: string;
      failedAt: string;
    };

const records = new Map<string, ProofIdempotencyRecord>();

export function resetProofIdempotency() {
  records.clear();
}

export function lookupProofIdempotency(requestHash: string) {
  return records.get(requestHash);
}

export function beginProofRequest(input: {
  requestHash: string;
  requestId: string;
  nowMs?: number;
}): ProofIdempotencyRecord {
  const existing = records.get(input.requestHash);
  if (existing?.status === "committed") return existing;
  if (existing?.status === "pending") {
    throw new AttestcoinError(
      "REPLAY",
      "An identical Attestcoin proof request is already in progress.",
      { retriable: true, requestId: input.requestId },
    );
  }
  if (existing?.status === "failed") {
    throw new AttestcoinError(
      "REPLAY",
      `An identical Attestcoin proof request already failed (${existing.kind}).`,
      { requestId: input.requestId },
    );
  }
  const created: ProofIdempotencyRecord = {
    status: "pending",
    requestHash: input.requestHash,
    requestId: input.requestId,
    startedAt: new Date(input.nowMs ?? Date.now()).toISOString(),
  };
  records.set(input.requestHash, created);
  return created;
}

export function commitProofRequest(
  requestHash: string,
  record: CanonicalAttestcoinProofRecord,
  nowMs = Date.now(),
) {
  const committed: ProofIdempotencyRecord = {
    status: "committed",
    requestHash,
    requestId: record.requestId,
    record,
    committedAt: new Date(nowMs).toISOString(),
  };
  records.set(requestHash, committed);
  return committed;
}

export function releaseProofRequest(requestHash: string) {
  const existing = records.get(requestHash);
  if (existing?.status === "pending") {
    records.delete(requestHash);
  }
}

export function failProofRequest(
  requestHash: string,
  requestId: string,
  kind: string,
  message: string,
  nowMs = Date.now(),
) {
  const failed: ProofIdempotencyRecord = {
    status: "failed",
    requestHash,
    requestId,
    kind,
    message,
    failedAt: new Date(nowMs).toISOString(),
  };
  records.set(requestHash, failed);
  return failed;
}
