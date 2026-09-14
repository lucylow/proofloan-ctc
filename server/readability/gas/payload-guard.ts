import { READABILITY_GAS_POLICY } from "./constants";
import type { GasRisk } from "./models";

export function encodedBytesFromHex(hex: string): number {
  const raw = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
  if (!raw) return 0;
  return Math.ceil(raw.length / 2);
}

export function assertProvableTransactionSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes < 0) {
    throw new Error("Invalid encoded transaction size");
  }
  if (bytes > READABILITY_GAS_POLICY.maxTransactionBytes) {
    throw new Error(
      `Transaction payload exceeds ${READABILITY_GAS_POLICY.maxTransactionBytes} byte readability guard`,
    );
  }
}

export function transactionSizeRisk(bytes: number): GasRisk {
  if (bytes > READABILITY_GAS_POLICY.maxTransactionBytes) return "blocked";
  if (bytes > 250_000) return "high";
  if (bytes > 100_000) return "medium";
  return "low";
}
