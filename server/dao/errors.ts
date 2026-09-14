export type DaoErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "THRESHOLD"
  | "CONSTITUTION"
  | "STATE"
  | "TRANSITION"
  | "VOTING"
  | "TIMELOCK"
  | "TREASURY"
  | "DELEGATION"
  | "GUARDIAN"
  | "EXECUTION"
  | "UNKNOWN";

export type DaoTrpcErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL_SERVER_ERROR";

export class DaoError extends Error {
  readonly code: DaoErrorCode;
  readonly retriable: boolean;
  readonly causeValue?: unknown;

  constructor(code: DaoErrorCode, message: string, retriable = false, causeValue?: unknown) {
    super(message.startsWith("[DAO:") ? message : `[DAO:${code}] ${message}`);
    this.name = "DaoError";
    this.code = code;
    this.retriable = retriable;
    this.causeValue = causeValue;
  }
}

export function isDaoError(error: unknown): error is DaoError {
  return error instanceof DaoError;
}

function issueMessages(error: { issues?: unknown }): string | undefined {
  if (!Array.isArray(error.issues) || error.issues.length === 0) return undefined;
  const messages = error.issues
    .map(issue => (issue && typeof issue === "object" && "message" in issue ? String((issue as { message: unknown }).message) : ""))
    .filter(Boolean);
  return messages.length ? messages.join("; ") : undefined;
}

export function isGovernanceTimestamp(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

export function parseGovernanceTimestamp(value: string | undefined, label: string): number {
  if (!isGovernanceTimestamp(value)) {
    throw new DaoError("VALIDATION", `invalid ${label} timestamp`);
  }
  return Date.parse(value);
}

export function parseGovernanceAmount(value: unknown, label: string): bigint {
  const text = typeof value === "bigint" ? value.toString() : String(value ?? "").trim();
  if (!/^-?\d+$/.test(text)) {
    throw new DaoError("TREASURY", `invalid ${label}`);
  }
  try {
    return BigInt(text);
  } catch (error) {
    throw new DaoError("TREASURY", `invalid ${label}`, false, error);
  }
}

export function parseSnapshotPower(value: unknown): bigint {
  if (typeof value === "bigint") {
    if (value < 0n) throw new DaoError("VALIDATION", "corrupt snapshot voting power");
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw new DaoError("VALIDATION", "corrupt snapshot voting power");
    return BigInt(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }
  throw new DaoError("VALIDATION", "corrupt snapshot voting power");
}

export function normalizeDaoError(error: unknown): DaoError {
  if (error instanceof DaoError) return error;

  if (error instanceof Error) {
    const message = error.message;
    const lower = message.toLowerCase();
    const zodMessage = issueMessages(error as { issues?: unknown });

    if (zodMessage || error.name === "ZodError") {
      return new DaoError("VALIDATION", zodMessage ?? message, false, error);
    }

    if (lower.includes("not found")) {
      return new DaoError("NOT_FOUND", message, false, error);
    }
    if (lower.includes("guardian")) {
      return new DaoError("GUARDIAN", message, false, error);
    }
    if (
      lower.includes("riskguard cannot") ||
      lower.includes("unverified evidence") ||
      lower.includes("mock mode must remain") ||
      lower.includes("constitution") ||
      lower.includes("invariant")
    ) {
      return new DaoError("CONSTITUTION", message, false, error);
    }
    if (lower.includes("threshold") || lower.includes("action count")) {
      return new DaoError("THRESHOLD", message, false, error);
    }
    if (lower.includes("treasury") || lower.includes("reserve")) {
      return new DaoError("TREASURY", message, false, error);
    }
    if (lower.includes("delegation") || lower.includes("cycle") || lower.includes("self-delegation")) {
      return new DaoError("DELEGATION", message, false, error);
    }
    if (lower.includes("timelock") || lower.includes("voting delay") || lower.includes("voting period not")) {
      return new DaoError("TIMELOCK", message, false, error);
    }
    if (
      lower.includes("vote already") ||
      lower.includes("inactive voter") ||
      lower.includes("snapshot voting") ||
      lower.includes("outside voting") ||
      lower.includes("proposal is not active") ||
      lower.includes("no snapshot")
    ) {
      return new DaoError("VOTING", message, false, error);
    }
    if (lower.includes("transition")) {
      return new DaoError("TRANSITION", message, false, error);
    }
    if (
      lower.includes("must pass") ||
      lower.includes("must be queued") ||
      lower.includes("cannot cancel") ||
      lower.includes("already in progress") ||
      lower.includes("not active")
    ) {
      return new DaoError("STATE", message, false, error);
    }
    if (error.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
      return new DaoError("EXECUTION", "Governance adapter timed out.", true, error);
    }
    if (
      lower.includes("adapter") ||
      lower.includes("execution") ||
      lower.includes("fetch") ||
      lower.includes("network") ||
      lower.includes("econn")
    ) {
      return new DaoError("EXECUTION", message, true, error);
    }
    if (lower.includes("invalid") || lower.includes("malformed") || error.name === "SyntaxError") {
      return new DaoError("VALIDATION", message, false, error);
    }

    return new DaoError("UNKNOWN", message, false, error);
  }

  return new DaoError("UNKNOWN", "Unknown governance error.", false, error);
}

export function trpcCodeForDaoError(error: DaoError): DaoTrpcErrorCode {
  if (error.code === "NOT_FOUND") return "NOT_FOUND";
  if (error.code === "GUARDIAN") return "FORBIDDEN";
  if (error.code === "STATE" || error.code === "VOTING" || error.code === "TRANSITION") return "CONFLICT";
  if (error.retriable) return "TIMEOUT";
  if (error.code === "UNKNOWN") return "INTERNAL_SERVER_ERROR";
  return "BAD_REQUEST";
}
