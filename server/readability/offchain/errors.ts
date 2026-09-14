import type { RetryClass } from "./types";

export class WorkerError extends Error {
  readonly retryClass: RetryClass;
  readonly retryable: boolean;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  constructor(code: string, message: string, retryClass: RetryClass, details?: Record<string, unknown>) {
    super(message);
    this.name = "WorkerError";
    this.code = code;
    this.retryClass = retryClass;
    this.retryable = retryClass !== "permanent";
    this.details = details;
  }
}

export function classifyError(error: unknown): WorkerError {
  if (error instanceof WorkerError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("429") || lower.includes("rate limit")) return new WorkerError("RATE_LIMIT", message, "rate-limit");
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("quorum") || lower.includes("rpc source")) {
    return new WorkerError("TIMEOUT", message, "transient");
  }
  if (lower.includes("attestation")) return new WorkerError("ATTESTATION", message, "attestation");
  if (lower.includes("reorg") || lower.includes("block hash")) return new WorkerError("REORG", message, "reorg");
  if (lower.includes("invalid") || lower.includes("unsupported") || lower.includes("revert")) return new WorkerError("PERMANENT", message, "permanent");
  return new WorkerError("UNKNOWN", message, "unknown");
}
