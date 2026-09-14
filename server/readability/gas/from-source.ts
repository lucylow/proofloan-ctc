import { estimateContinuityHashes } from "./continuity";
import { expectedMerkleSiblings } from "./merkle";
import { encodedBytesFromHex } from "./payload-guard";
import type { QueryPlanningInput } from "./query-plan";

export function planningInputFromSource(args: {
  eventBlock: number;
  attestedBlock: number;
  encodedTransactionHex: string;
  transactionCount?: number;
  merkleSiblingCount?: number;
  deadlineMs?: number;
  nowMs?: number;
}): QueryPlanningInput {
  const continuityHashCount = estimateContinuityHashes(args.eventBlock, args.attestedBlock);
  const merkleSiblingCount =
    args.merkleSiblingCount ??
    (args.transactionCount != null ? expectedMerkleSiblings(args.transactionCount) : 1);
  return {
    continuityHashCount,
    merkleSiblingCount,
    encodedTransactionBytes: encodedBytesFromHex(args.encodedTransactionHex),
    eventBlock: args.eventBlock,
    attestedBlock: args.attestedBlock,
    deadlineMs: args.deadlineMs,
    nowMs: args.nowMs,
  };
}
