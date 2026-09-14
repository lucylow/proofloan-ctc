export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export type ErrorSource =
  | "runtime"
  | "network"
  | "wallet"
  | "storage"
  | "validation"
  | "query"
  | "mutation"
  | "demo"
  | "navigation"
  | "unknown";

export type NormalizedAppError = {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  retryable: boolean;
  recoverable: boolean;
  cause?: unknown;
  timestamp: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
};

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: NormalizedAppError };

export type AsyncStatus = "idle" | "pending" | "success" | "error" | "cancelled";
