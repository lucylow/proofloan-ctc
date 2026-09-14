export type AtcErrorCode =
  | "VALIDATION"
  | "POLICY"
  | "EXPIRED"
  | "IDEMPOTENCY"
  | "INTEGRITY"
  | "PAYMENT"
  | "PROTOCOL"
  | "ADAPTER"
  | "UNKNOWN";

export type AtcTrpcErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class AtcError extends Error {
  readonly code: AtcErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: AtcErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[ATC:") ? message : `[ATC:${code}] ${message}`);
    this.name = "AtcError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isAtcError(error: unknown): error is AtcError {
  return error instanceof AtcError;
}

export function normalizeAtcError(error: unknown): AtcError {
  if (error instanceof AtcError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (
      lower.includes("unsupported atc chain") ||
      lower.includes("malformed") ||
      lower.includes("invalid") ||
      lower.includes("does not match")
    ) {
      return new AtcError("VALIDATION", message, false, error);
    }

    if (lower.includes("expired")) {
      return new AtcError("EXPIRED", message, false, error);
    }

    if (lower.includes("idempotency") || lower.includes("already exists")) {
      return new AtcError("IDEMPOTENCY", message, false, error);
    }

    if (lower.includes("integrity") || lower.includes("hash")) {
      return new AtcError("INTEGRITY", message, false, error);
    }

    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
      return new AtcError("PAYMENT", "External ATC payment verification timed out.", true, error);
    }

    if (
      lower.includes("fetch") ||
      lower.includes("network") ||
      lower.includes("econn") ||
      lower.includes("enotfound")
    ) {
      return new AtcError("PAYMENT", "External ATC payment adapter is unreachable.", true, error);
    }

    return new AtcError("UNKNOWN", message, false, error);
  }

  return new AtcError("UNKNOWN", "Unknown ATC error.", false, error);
}

export function trpcCodeForAtcError(error: AtcError): AtcTrpcErrorCode {
  if (error.code === "IDEMPOTENCY") return "CONFLICT";
  if (error.retriable) return "TIMEOUT";
  if (error.code === "UNKNOWN") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
