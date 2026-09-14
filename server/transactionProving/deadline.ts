import { TransactionProvingError } from "./errors";

export function assertBeforeDeadline(start: number, deadlineMs: number, now = Date.now()): void {
  if (now - start > deadlineMs) {
    throw new TransactionProvingError("DEADLINE", "PROOF_DEADLINE_EXCEEDED", true);
  }
}
