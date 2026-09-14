export type OperatorErrorCode =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "ACCOUNT"
  | "RPC"
  | "LIFECYCLE"
  | "POLICY"
  | "CONFIG"
  | "UNKNOWN";

export type OperatorTrpcErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class OperatorError extends Error {
  readonly code: OperatorErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: OperatorErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[OPERATOR:") ? message : `[OPERATOR:${code}] ${message}`);
    this.name = "OperatorError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isOperatorError(error: unknown): error is OperatorError {
  return error instanceof OperatorError;
}

export function parseAtomicBalance(
  value: string | undefined,
): { ok: true; value: bigint } | { ok: false; value: bigint; message: string } {
  if (value == null || value.trim() === "") return { ok: true, value: 0n };
  const trimmed = value.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    return {
      ok: false,
      value: 0n,
      message: "Atomic balance is not a non-negative integer.",
    };
  }
  try {
    return { ok: true, value: BigInt(trimmed) };
  } catch {
    return { ok: false, value: 0n, message: "Atomic balance could not be parsed." };
  }
}

export function parseBoundedInteger(
  value: string | number | undefined,
  fallback: number,
  options: { min?: number; max?: number } = {},
): number {
  const min = options.min ?? Number.MIN_SAFE_INTEGER;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  const parsed = typeof value === "number" ? value : value == null || value.trim() === "" ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

export function normalizeOperatorError(error: unknown): OperatorError {
  if (error instanceof OperatorError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (
      lower.includes("unsupported chain key") ||
      lower.includes("chain key") ||
      lower.includes("malformed") ||
      lower.includes("invalid") ||
      lower.includes("not a non-negative integer")
    ) {
      return new OperatorError("VALIDATION", message, false, error);
    }

    if (lower.includes("authoriz") || lower.includes("notpreauthorized")) {
      return new OperatorError("AUTHORIZATION", message, false, error);
    }

    if (lower.includes("attestor and stash") || lower.includes("account")) {
      return new OperatorError("ACCOUNT", message, false, error);
    }

    if (lower.includes("rpc") || lower.includes("endpoint")) {
      const retriable = /timeout|unhealthy|unavailable|network|connection/.test(lower);
      return new OperatorError("RPC", message, retriable, error);
    }

    if (lower.includes("transition") || lower.includes("lifecycle")) {
      return new OperatorError("LIFECYCLE", message, false, error);
    }

    if (lower.includes("secret material") || lower.includes("config")) {
      return new OperatorError("CONFIG", message, false, error);
    }

    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out")) {
      return new OperatorError("RPC", "Operator RPC request timed out.", true, error);
    }

    return new OperatorError("UNKNOWN", message, false, error);
  }

  return new OperatorError("UNKNOWN", "Unknown Attestor operator error.", false, error);
}

export function trpcCodeForOperatorError(error: OperatorError): OperatorTrpcErrorCode {
  if (error.code === "LIFECYCLE") return "CONFLICT";
  if (error.retriable) return "TIMEOUT";
  if (error.code === "UNKNOWN") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
