import type { ErrorSource, NormalizedAppError } from "./types";

const USER_MESSAGES: Record<string, string> = {
  NETWORK_OFFLINE: "You appear to be offline. Reconnect and try again.",
  NETWORK_TIMEOUT: "The request took too long. Please try again.",
  NETWORK_FAILED: "We could not reach the ProofLoan service.",
  WALLET_MISSING: "No compatible wallet was detected in this browser.",
  WALLET_REJECTED: "The wallet request was cancelled.",
  WALLET_LOCKED: "Unlock your wallet and try again.",
  WRONG_NETWORK: "Your wallet is connected to an unsupported network.",
  STORAGE_UNAVAILABLE: "Local browser storage is unavailable. Your session can continue without it.",
  VALIDATION_FAILED: "Some information is missing or invalid.",
  ROUTE_INVALID: "That destination is not available.",
  DEMO_DATA_INVALID: "Demo data was incomplete, so a safe fallback was loaded.",
  REQUEST_CANCELLED: "The request was cancelled.",
  UNKNOWN_ERROR: "ProofLoan encountered an unexpected problem.",
};

export class ProofLoanAppError extends Error {
  readonly code: string;
  readonly source: ErrorSource;
  readonly retryable: boolean;
  readonly recoverable: boolean;
  readonly metadata?: Record<string, string | number | boolean | null>;

  constructor(options: {
    code: string;
    message: string;
    source?: ErrorSource;
    retryable?: boolean;
    recoverable?: boolean;
    metadata?: Record<string, string | number | boolean | null>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ProofLoanAppError";
    this.code = options.code;
    this.source = options.source ?? "unknown";
    this.retryable = options.retryable ?? false;
    this.recoverable = options.recoverable ?? true;
    this.metadata = options.metadata;
  }
}

function messageFromUnknown(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  return "Unknown error";
}

function codeFromUnknown(error: unknown): string | undefined {
  if (error instanceof ProofLoanAppError) return error.code;
  if (typeof error === "object" && error !== null && "code" in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function normalizeAppError(
  error: unknown,
  fallback?: Partial<Pick<NormalizedAppError, "source" | "severity" | "retryable" | "recoverable">>,
): NormalizedAppError {
  const message = messageFromUnknown(error);
  const code = codeFromUnknown(error) ?? inferErrorCode(message);
  const source = error instanceof ProofLoanAppError ? error.source : fallback?.source ?? "unknown";
  const retryable = error instanceof ProofLoanAppError ? error.retryable : fallback?.retryable ?? isRetryableCode(code);
  const recoverable = error instanceof ProofLoanAppError ? error.recoverable : fallback?.recoverable ?? true;

  return {
    code,
    message: message.slice(0, 500),
    userMessage: USER_MESSAGES[code] ?? USER_MESSAGES.UNKNOWN_ERROR,
    severity: fallback?.severity ?? severityFor(code),
    source,
    retryable,
    recoverable,
    cause: error,
    timestamp: Date.now(),
    metadata: error instanceof ProofLoanAppError ? error.metadata : undefined,
  };
}

export function inferErrorCode(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("abort") || normalized.includes("cancel")) return "REQUEST_CANCELLED";
  if (normalized.includes("timeout")) return "NETWORK_TIMEOUT";
  if (normalized.includes("network") || normalized.includes("failed to fetch")) return "NETWORK_FAILED";
  if (normalized.includes("offline")) return "NETWORK_OFFLINE";
  if (normalized.includes("user rejected") || normalized.includes("rejected the request")) return "WALLET_REJECTED";
  if (normalized.includes("wallet")) return "WALLET_MISSING";
  return "UNKNOWN_ERROR";
}

export function isRetryableCode(code: string): boolean {
  return [
    "NETWORK_TIMEOUT",
    "NETWORK_FAILED",
    "NETWORK_OFFLINE",
    "SERVICE_UNAVAILABLE",
    "RATE_LIMITED",
  ].includes(code);
}

export function severityFor(code: string): NormalizedAppError["severity"] {
  if (code === "UNKNOWN_ERROR") return "error";
  if (code === "NETWORK_OFFLINE" || code === "REQUEST_CANCELLED") return "info";
  if (code === "WRONG_NETWORK" || code === "VALIDATION_FAILED") return "warning";
  return "error";
}

export function errorToProofLoanError(error: unknown, source: ErrorSource): ProofLoanAppError {
  const normalized = normalizeAppError(error, { source });
  return new ProofLoanAppError({
    code: normalized.code,
    message: normalized.message,
    source,
    retryable: normalized.retryable,
    recoverable: normalized.recoverable,
    metadata: normalized.metadata,
    cause: error,
  });
}
