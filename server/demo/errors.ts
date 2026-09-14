export type DemoErrorCode =
  | "DISABLED"
  | "VALIDATION"
  | "CONFIG"
  | "GENERATION"
  | "SCORING"
  | "STORE"
  | "FALLBACK"
  | "LIVE_CLAIM"
  | "CATALOG"
  | "UNKNOWN";

export type DemoTrpcErrorCode =
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class DemoError extends Error {
  readonly code: DemoErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: DemoErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[DEMO:") ? message : `[DEMO:${code}] ${message}`);
    this.name = "DemoError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isDemoError(error: unknown): error is DemoError {
  return error instanceof DemoError;
}

function issueMessages(error: { issues?: unknown }): string | undefined {
  if (!Array.isArray(error.issues) || error.issues.length === 0) return undefined;
  const messages = error.issues
    .map(issue => (issue && typeof issue === "object" && "message" in issue ? String((issue as { message: unknown }).message) : ""))
    .filter(Boolean);
  return messages.length ? messages.join("; ") : undefined;
}

export function normalizeDemoError(error: unknown): DemoError {
  if (error instanceof DemoError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();
    const zodMessage = issueMessages(error as { issues?: unknown });

    if (zodMessage || error.name === "ZodError") {
      return new DemoError("VALIDATION", zodMessage ?? message, false, error);
    }

    if (lower.includes("disabled")) {
      return new DemoError("DISABLED", message, false, error);
    }
    if (lower.includes("live attestcoin claim") || lower.includes("live-chain claim")) {
      return new DemoError("LIVE_CLAIM", message, false, error);
    }
    if (lower.includes("unknown demo profile") || lower.includes("unknown extended demo case") || lower.includes("invalid demo")) {
      return new DemoError("VALIDATION", message, false, error);
    }
    if (lower.includes("duplicate extended") || lower.includes("without facts") || lower.includes("without mock labels") || lower.includes("catalog")) {
      return new DemoError("CATALOG", message, false, error);
    }
    if (lower.includes("config") || lower.includes("environment")) {
      return new DemoError("CONFIG", message, false, error);
    }
    if (lower.includes("score") || lower.includes("underwrit") || lower.includes("riskguard")) {
      return new DemoError("SCORING", message, false, error);
    }
    if (lower.includes("fallback")) {
      return new DemoError("FALLBACK", message, false, error);
    }
    if (lower.includes("store") || lower.includes("ephemeral") || lower.includes("snapshot")) {
      return new DemoError("STORE", message, true, error);
    }
    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out")) {
      return new DemoError("UNKNOWN", "Demo request timed out.", true, error);
    }
    if (lower.includes("generat") || lower.includes("synthetic") || lower.includes("fact")) {
      return new DemoError("GENERATION", message, false, error);
    }

    return new DemoError("UNKNOWN", message, false, error);
  }

  return new DemoError("UNKNOWN", "Unknown demo error.", false, error);
}

export function trpcCodeForDemoError(error: DemoError): DemoTrpcErrorCode {
  if (error.code === "DISABLED" || error.code === "LIVE_CLAIM") return "FORBIDDEN";
  if (error.code === "VALIDATION" && /unknown extended demo case|unknown demo profile/i.test(error.message)) {
    return "NOT_FOUND";
  }
  if (error.retriable) return "TIMEOUT";
  if (error.code === "UNKNOWN" || error.code === "STORE" || error.code === "SCORING") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}

export function isFiniteTimestamp(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
