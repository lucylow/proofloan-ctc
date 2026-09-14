import type { ExtractionResult } from "./types";
import { TransactionProvingError } from "./errors";

export function requireSuccess(result: ExtractionResult): true {
  if (result.status !== 1) {
    throw new TransactionProvingError("RECEIPT", "TRANSACTION_NOT_SUCCESSFUL");
  }
  return true;
}
