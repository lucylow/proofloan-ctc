import { isTransactionProvingError, normalizeTransactionProvingError } from "./errors";

export interface RecoveryPlan {
  retry: boolean;
  requeue: boolean;
  reason: string;
}

export function recover(error: unknown): RecoveryPlan {
  const proving = isTransactionProvingError(error) ? error : undefined;
  if (proving) {
    if (proving.code === "FRESHNESS" || proving.code === "REORG") {
      return { retry: false, requeue: true, reason: "refresh-attestation" };
    }
    if (proving.retriable) return { retry: true, requeue: true, reason: "transient" };
    return { retry: false, requeue: false, reason: "terminal" };
  }

  const s = error instanceof Error ? error.message : String(error);
  if (/stale/i.test(s)) return { retry: false, requeue: true, reason: "refresh-attestation" };
  if (/timeout|network/i.test(s)) return { retry: true, requeue: true, reason: "transient" };
  return { retry: false, requeue: false, reason: "terminal" };
}

export function retryableProofError(error: unknown): boolean {
  if (isTransactionProvingError(error)) return error.retriable;
  return recover(normalizeTransactionProvingError(error)).retry;
}

export function detectReorg(parentHash: string, expectedParentHash: string): boolean {
  return parentHash.toLowerCase() !== expectedParentHash.toLowerCase();
}
