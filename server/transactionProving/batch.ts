import { MAX_BATCH_TARGETS } from "./constants";
import type { TransactionTarget } from "./types";

export function partitionTargets(targets: TransactionTarget[]): TransactionTarget[][] {
  const out: TransactionTarget[][] = [];
  for (let i = 0; i < targets.length; i += MAX_BATCH_TARGETS) {
    out.push(targets.slice(i, i + MAX_BATCH_TARGETS));
  }
  return out;
}
