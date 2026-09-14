import { normalizeAppError } from "./appError";
import type { Result } from "./types";

export type TransactionStatus = "unknown" | "pending" | "confirmed" | "failed";

export function validateTransactionHash(value: unknown): Result<string> {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{64}$/.test(value.trim())) {
    return {
      ok: false,
      error: normalizeAppError(new Error("Invalid transaction hash"), { source: "validation" }),
    };
  }
  return { ok: true, value: value.trim() };
}

export function classifyTransactionStatus(receipt: unknown): TransactionStatus {
  if (!receipt || typeof receipt !== "object") return "unknown";
  const status = (receipt as { status?: unknown }).status;
  if (status === 1 || status === "1") return "confirmed";
  if (status === 0 || status === "0") return "failed";
  return "unknown";
}
