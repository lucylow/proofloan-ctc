import type { EncodedTransaction, ExtractionResult } from "./types";
import { TransactionProvingError } from "./errors";

export interface TransactionDecoder {
  decode(tx: EncodedTransaction): ExtractionResult;
}

/**
 * Decode boundary only. Business logic must not run until verification and
 * a successful source receipt are confirmed.
 */
export class SafeDecoder implements TransactionDecoder {
  decode(tx: EncodedTransaction): ExtractionResult {
    if (!tx.hex.startsWith("0x")) {
      throw new TransactionProvingError("EXTRACTION", "ENCODED_TX_NOT_HEX");
    }
    return { status: 1, txType: 0, from: undefined, to: undefined, value: "0", logs: [] };
  }
}
