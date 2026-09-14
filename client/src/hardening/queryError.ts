import { TRPCClientError } from "@trpc/client";
import { normalizeAppError } from "./appError";

export function isUnauthorizedQueryError(error: unknown): boolean {
  return error instanceof TRPCClientError && (
    error.message.toLowerCase().includes("unauthorized") ||
    error.data?.code === "UNAUTHORIZED"
  );
}

export function isRateLimitedQueryError(error: unknown): boolean {
  return error instanceof TRPCClientError && (
    error.data?.code === "TOO_MANY_REQUESTS" ||
    error.message.toLowerCase().includes("rate limit")
  );
}

export function normalizeQueryError(error: unknown) {
  return normalizeAppError(error, { source: "query" });
}

export function shouldRetryQuery(error: unknown, failureCount: number): boolean {
  if (failureCount >= 2) return false;
  if (isUnauthorizedQueryError(error)) return false;
  const normalized = normalizeQueryError(error);
  return normalized.retryable;
}
