import { createClientErrorReport } from "@/lib/clientErrorReporter";
import type { ErrorSource, NormalizedAppError } from "./types";
import { normalizeAppError } from "./appError";

const seen = new Set<string>();
const MAX_SEEN = 200;

function fingerprint(error: NormalizedAppError) {
  return `${error.source}:${error.code}:${error.message}`;
}

export function logHardeningError(source: ErrorSource, error: unknown, metadata?: Record<string, string | number | boolean | null>) {
  const normalized = normalizeAppError(error, { source });
  if (metadata) normalized.metadata = { ...(normalized.metadata ?? {}), ...metadata };

  const key = fingerprint(normalized);
  if (seen.has(key)) return normalized;

  seen.add(key);
  if (seen.size > MAX_SEEN) {
    const first = seen.values().next().value;
    if (first) seen.delete(first);
  }

  try {
    createClientErrorReport(source === "navigation" ? "runtime" : source === "query" ? "query" : "mutation", error);
  } catch {
    // Logging must never crash the application.
  }

  console.warn("[ProofLoan hardening]", normalized);
  return normalized;
}
