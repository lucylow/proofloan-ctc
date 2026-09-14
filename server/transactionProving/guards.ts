import type { EncodedTransaction, ExtractionResult, ProofEnvelope } from "./types";
import { DEFAULT_MAX_TX_BYTES } from "./constants";
import { TransactionProvingError } from "./errors";

export function requireSuccessfulReceipt(result: ExtractionResult): void {
  if (result.status !== 1) {
    throw new TransactionProvingError("RECEIPT", "SOURCE_TRANSACTION_FAILED");
  }
}

export function requireFreshEnvelope(
  envelope: ProofEnvelope,
  currentAttestationBlock: bigint,
  maxLag = 2_000n,
): void {
  if (currentAttestationBlock - envelope.transaction.blockNumber > maxLag) {
    throw new TransactionProvingError("FRESHNESS", "PROOF_STALE");
  }
}

export function requireEncodedTransactionLimit(
  tx: EncodedTransaction,
  maxBytes = DEFAULT_MAX_TX_BYTES,
): void {
  if (tx.byteLength > maxBytes) {
    throw new TransactionProvingError("SIZE", "TX_TOO_LARGE");
  }
}
