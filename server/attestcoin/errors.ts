export type AttestcoinErrorKind =
  | "VALIDATION"
  | "SOURCE_RPC"
  | "ATTESTATION_PENDING"
  | "PROOF_BUILDER"
  | "PROOF_VERIFICATION"
  | "DECODING"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "CIRCUIT_OPEN"
  | "UNSUPPORTED_CHAIN"
  | "STALE_PROOF"
  | "RECEIPT_FAILED"
  | "REPLAY"
  | "UNKNOWN";

export class AttestcoinError extends Error {
  readonly kind: AttestcoinErrorKind;
  readonly retriable: boolean;
  readonly causeValue?: unknown;
  readonly requestId?: string;

  constructor(
    kind: AttestcoinErrorKind,
    message: string,
    options: {
      retriable?: boolean;
      causeValue?: unknown;
      requestId?: string;
    } = {},
  ) {
    super(message);
    this.name = "AttestcoinError";
    this.kind = kind;
    this.retriable = options.retriable ?? false;
    this.causeValue = options.causeValue;
    this.requestId = options.requestId;
  }
}

export function normalizeAttestcoinError(
  error: unknown,
  requestId?: string,
): AttestcoinError {
  if (error instanceof AttestcoinError) return error;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("experimental") ||
      message.includes("chainkey") ||
      message.includes("unsupported")
    ) {
      return new AttestcoinError("UNSUPPORTED_CHAIN", error.message, {
        retriable: false,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("timeout") || message.includes("timed out")) {
      return new AttestcoinError("TIMEOUT", error.message, {
        retriable: true,
        causeValue: error,
        requestId,
      });
    }

    if (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return new AttestcoinError("RATE_LIMITED", error.message, {
        retriable: true,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("circuit")) {
      return new AttestcoinError("CIRCUIT_OPEN", error.message, {
        retriable: true,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("stale")) {
      return new AttestcoinError("STALE_PROOF", error.message, {
        retriable: false,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("receipt")) {
      return new AttestcoinError("RECEIPT_FAILED", error.message, {
        retriable: false,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("replay") || message.includes("idempotency")) {
      return new AttestcoinError("REPLAY", error.message, {
        retriable: false,
        causeValue: error,
        requestId,
      });
    }

    if (
      message.includes("proof") &&
      (message.includes("verify") || message.includes("validation"))
    ) {
      return new AttestcoinError("PROOF_VERIFICATION", error.message, {
        retriable: false,
        causeValue: error,
        requestId,
      });
    }

    if (message.includes("proof")) {
      return new AttestcoinError("PROOF_BUILDER", error.message, {
        retriable: true,
        causeValue: error,
        requestId,
      });
    }

    if (
      message.includes("rpc") ||
      message.includes("network") ||
      message.includes("fetch")
    ) {
      return new AttestcoinError("SOURCE_RPC", error.message, {
        retriable: true,
        causeValue: error,
        requestId,
      });
    }

    return new AttestcoinError("UNKNOWN", error.message, {
      retriable: false,
      causeValue: error,
      requestId,
    });
  }

  return new AttestcoinError(
    "UNKNOWN",
    "Unknown Attestcoin Protocol error.",
    { retriable: false, causeValue: error, requestId },
  );
}
