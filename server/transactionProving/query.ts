import type { ProvingRequest, TransactionTarget } from "./types";
import {
  DEFAULT_FRESHNESS_WINDOW_BLOCKS,
  DEFAULT_MAX_CONTINUITY_HASHES,
  DEFAULT_MAX_TX_BYTES,
  DEFAULT_REQUEST_DEADLINE_MS,
} from "./constants";
import { TransactionProvingError } from "./errors";
import { validateRequest } from "./validation";

export class QueryPlanner {
  create(target: TransactionTarget, now = Date.now()): ProvingRequest {
    const request: ProvingRequest = {
      requestId: `pq_${now}_${target.chainKey}_${target.txHash.slice(2, 10)}`,
      target,
      requestedAt: now,
      maxTransactionBytes: DEFAULT_MAX_TX_BYTES,
      maxContinuityHashes: DEFAULT_MAX_CONTINUITY_HASHES,
      freshnessWindowBlocks: DEFAULT_FRESHNESS_WINDOW_BLOCKS,
      deadlineMs: DEFAULT_REQUEST_DEADLINE_MS,
    };
    const errors = validateRequest(request).filter(issue => issue.fatal);
    if (errors.length) {
      throw new TransactionProvingError("QUERY", errors.map(error => error.code).join(","));
    }
    return request;
  }
}
