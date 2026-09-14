import { AttestcoinError } from "../attestcoin/errors";

export type ReadabilityErrorCode =
  | "EVENT_POLICY"
  | "FINALITY"
  | "ATTESTATION"
  | "EXPIRED"
  | "REPLAY"
  | "PROOF"
  | "RECEIPT"
  | "TRANSITION"
  | "VALIDATION"
  | "LIVE_BOUNDARY"
  | "CHAIN"
  | "GAS"
  | "TIMEOUT"
  | "STORE"
  | "UNKNOWN";

export type ReadabilityTrpcErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class ReadabilityError extends Error {
  readonly code: ReadabilityErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: ReadabilityErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[READABILITY:") ? message : `[READABILITY:${code}] ${message}`);
    this.name = "ReadabilityError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isReadabilityError(error: unknown): error is ReadabilityError {
  return error instanceof ReadabilityError;
}

export function isValidTimestamp(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

export function normalizeReadabilityError(error: unknown): ReadabilityError {
  if (error instanceof ReadabilityError) return error;

  if (error instanceof AttestcoinError) {
    if (error.kind === "UNSUPPORTED_CHAIN" || error.kind === "VALIDATION") {
      return new ReadabilityError("CHAIN", error.message, false, error);
    }
    if (error.kind === "TIMEOUT" || error.kind === "RATE_LIMITED" || error.kind === "CIRCUIT_OPEN") {
      return new ReadabilityError("TIMEOUT", error.message, true, error);
    }
    if (error.kind === "ATTESTATION_PENDING" || error.kind === "STALE_PROOF") {
      return new ReadabilityError("ATTESTATION", error.message, error.retriable, error);
    }
    if (error.kind === "PROOF_BUILDER" || error.kind === "PROOF_VERIFICATION") {
      return new ReadabilityError("PROOF", error.message, error.retriable, error);
    }
    if (error.kind === "RECEIPT_FAILED") {
      return new ReadabilityError("RECEIPT", error.message, false, error);
    }
    if (error.kind === "REPLAY") {
      return new ReadabilityError("REPLAY", error.message, false, error);
    }
    return new ReadabilityError(error.retriable ? "TIMEOUT" : "UNKNOWN", error.message, error.retriable, error);
  }

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (lower.includes("generic source event") || lower.includes("event policy") || lower.includes("focused source")) {
      return new ReadabilityError("EVENT_POLICY", message, false, error);
    }
    if (lower.includes("confirmation") || lower.includes("finality") || lower.includes("reorg")) {
      return new ReadabilityError("FINALITY", message, true, error);
    }
    if (lower.includes("replay") || lower.includes("already been consumed") || lower.includes("terminal")) {
      return new ReadabilityError("REPLAY", message, false, error);
    }
    if (lower.includes("expired") || lower.includes("deadline")) {
      return new ReadabilityError("EXPIRED", message, false, error);
    }
    if (lower.includes("transition")) {
      return new ReadabilityError("TRANSITION", message, false, error);
    }
    if (lower.includes("receipt")) {
      return new ReadabilityError("RECEIPT", message, false, error);
    }
    if (lower.includes("gas") || lower.includes("ctc") || lower.includes("budget")) {
      return new ReadabilityError("GAS", message, /retry|later|defer/.test(lower), error);
    }
    if (lower.includes("proof")) {
      return new ReadabilityError("PROOF", message, true, error);
    }
    if (lower.includes("chainkey") || lower.includes("unsupported") || lower.includes("environment")) {
      return new ReadabilityError("CHAIN", message, false, error);
    }
    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
      return new ReadabilityError("TIMEOUT", "Readability adapter timed out.", true, error);
    }
    if (lower.includes("rpc") || lower.includes("network") || lower.includes("fetch") || lower.includes("econn")) {
      return new ReadabilityError("TIMEOUT", "Readability adapter is unreachable.", true, error);
    }
    if (lower.includes("store") || lower.includes("persist")) {
      return new ReadabilityError("STORE", message, true, error);
    }
    return new ReadabilityError("UNKNOWN", message, false, error);
  }

  return new ReadabilityError("UNKNOWN", "Unknown readability error.", false, error);
}

export function trpcCodeForReadabilityError(error: ReadabilityError): ReadabilityTrpcErrorCode {
  if (error.code === "REPLAY") return "CONFLICT";
  if (error.retriable || error.code === "TIMEOUT" || error.code === "FINALITY") return "TIMEOUT";
  if (error.code === "UNKNOWN" || error.code === "STORE") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
