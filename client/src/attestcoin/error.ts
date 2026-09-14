import type { AttestcoinUiError } from "./types";

export function normalizeAttestcoinClientError(
  error: unknown,
): AttestcoinUiError {
  const message =
    error instanceof Error
      ? error.message
      : "Attestcoin request failed.";

  const lower = message.toLowerCase();

  const retriable =
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("rate") ||
    lower.includes("offline") ||
    lower.includes("source_rpc") ||
    lower.includes("proof_builder") ||
    lower.includes("circuit");

  const kind =
    message.match(/\[ATTESTCOIN:([^\]]+)\]/)?.[1] ??
    "UNKNOWN";

  return {
    kind,
    message: message.replace(/^\[ATTESTCOIN:[^\]]+\]\s*/, ""),
    retriable,
  };
}
