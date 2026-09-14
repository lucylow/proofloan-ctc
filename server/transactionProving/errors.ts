export type TransactionProvingErrorCode =
  | "QUERY"
  | "PROOF"
  | "DEADLINE"
  | "FRESHNESS"
  | "SIZE"
  | "RECEIPT"
  | "REPLAY"
  | "REORG"
  | "PROVIDER"
  | "BACKPRESSURE"
  | "VERIFICATION"
  | "EXTRACTION"
  | "STORE"
  | "VALIDATION"
  | "UNKNOWN";

export type TransactionProvingTrpcErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class TransactionProvingError extends Error {
  readonly code: TransactionProvingErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: TransactionProvingErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[PROVING:") ? message : `[PROVING:${code}] ${message}`);
    this.name = "TransactionProvingError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isTransactionProvingError(error: unknown): error is TransactionProvingError {
  return error instanceof TransactionProvingError;
}

export function normalizeTransactionProvingError(error: unknown): TransactionProvingError {
  if (error instanceof TransactionProvingError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (lower.includes("unknown proof request") || lower.includes("store")) {
      return new TransactionProvingError("STORE", message, false, error);
    }
    if (lower.includes("replay") || lower.includes("already been consumed")) {
      return new TransactionProvingError("REPLAY", message, false, error);
    }
    if (lower.includes("stale") || lower.includes("freshness") || lower.includes("attestation_precedes")) {
      return new TransactionProvingError("FRESHNESS", message, false, error);
    }
    if (lower.includes("reorg")) {
      return new TransactionProvingError("REORG", message, true, error);
    }
    if (lower.includes("deadline")) {
      return new TransactionProvingError("DEADLINE", message, true, error);
    }
    if (lower.includes("backpressure")) {
      return new TransactionProvingError("BACKPRESSURE", message, true, error);
    }
    if (lower.includes("too large") || lower.includes("tx_too_large") || lower.includes("size")) {
      return new TransactionProvingError("SIZE", message, false, error);
    }
    if (lower.includes("receipt") || lower.includes("transaction_not_successful")) {
      return new TransactionProvingError("RECEIPT", message, false, error);
    }
    if (lower.includes("verify") || lower.includes("block prover") || lower.includes("rejected")) {
      return new TransactionProvingError("VERIFICATION", message, false, error);
    }
    if (lower.includes("extract") || lower.includes("decode") || lower.includes("hex")) {
      return new TransactionProvingError("EXTRACTION", message, false, error);
    }
    if (lower.includes("invalid") || lower.includes("malformed") || lower.includes("chainkey") || lower.includes("txhash")) {
      return new TransactionProvingError("QUERY", message, false, error);
    }
    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
      return new TransactionProvingError("PROVIDER", "Proof provider timed out.", true, error);
    }
    if (
      lower.includes("provider") ||
      lower.includes("unhealthy") ||
      lower.includes("network") ||
      lower.includes("fetch") ||
      lower.includes("econn")
    ) {
      return new TransactionProvingError("PROVIDER", message, true, error);
    }
    if (lower.includes("proof")) {
      return new TransactionProvingError("PROOF", message, true, error);
    }
    return new TransactionProvingError("UNKNOWN", message, false, error);
  }

  return new TransactionProvingError("UNKNOWN", "Unknown transaction proving error.", false, error);
}

export function trpcCodeForTransactionProvingError(error: TransactionProvingError): TransactionProvingTrpcErrorCode {
  if (error.code === "REPLAY") return "CONFLICT";
  if (error.retriable || error.code === "DEADLINE" || error.code === "PROVIDER" || error.code === "BACKPRESSURE") {
    return "TIMEOUT";
  }
  if (error.code === "UNKNOWN" || error.code === "STORE") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
