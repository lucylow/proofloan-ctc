export type AiErrorCode =
  | "VALIDATION"
  | "PROVIDER"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "POLICY"
  | "SANITIZE"
  | "BATCH"
  | "UNKNOWN";

export type AiTrpcErrorCode =
  | "BAD_REQUEST"
  | "TIMEOUT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR";

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: AiErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[AI:") ? message : `[AI:${code}] ${message}`);
    this.name = "AiError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isAiError(error: unknown): error is AiError {
  return error instanceof AiError;
}

export function normalizeAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();

    if (
      lower.includes("validation") ||
      lower.includes("malformed") ||
      lower.includes("invalid") ||
      lower.includes("not finite") ||
      lower.includes("out of range") ||
      lower.includes("unsupported chain")
    ) {
      return new AiError("VALIDATION", message, false, error);
    }

    if (error.name === "AbortError" || lower.includes("timed out") || lower.includes("timeout") || lower.includes("aborted")) {
      return new AiError("TIMEOUT", "AI provider timed out.", true, error);
    }

    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("too many requests")) {
      return new AiError("RATE_LIMITED", "AI provider is rate-limited.", true, error);
    }

    if (lower.includes("json") || lower.includes("sanitize") || lower.includes("parse")) {
      return new AiError("SANITIZE", "AI provider returned an unusable payload.", false, error);
    }

    if (
      lower.includes("policy") ||
      lower.includes("abstain") ||
      lower.includes("mock blockchain evidence")
    ) {
      return new AiError("POLICY", message, false, error);
    }

    if (
      lower.includes("fetch") ||
      lower.includes("network") ||
      lower.includes("econn") ||
      lower.includes("enotfound") ||
      lower.includes("provider") ||
      lower.includes("openai") ||
      lower.includes("api key")
    ) {
      return new AiError("PROVIDER", "AI provider is unavailable.", true, error);
    }

    return new AiError("UNKNOWN", message, false, error);
  }

  return new AiError("UNKNOWN", "Unknown AI underwriting error.", false, error);
}

export function trpcCodeForAiError(error: AiError): AiTrpcErrorCode {
  if (error.code === "RATE_LIMITED") return "TOO_MANY_REQUESTS";
  if (error.retriable || error.code === "TIMEOUT") return "TIMEOUT";
  if (error.code === "UNKNOWN" || error.code === "PROVIDER") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
