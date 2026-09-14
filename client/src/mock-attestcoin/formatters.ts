import type { MockFreshness, MockProofStatus } from "./types";

export function formatProofStatus(status: MockProofStatus) {
  return status.replace(/-/g, " ");
}

export function formatFreshness(freshness: MockFreshness) {
  return freshness;
}

export function formatUsd(value: number) {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDC`;
}

export function formatHash(value: string) {
  if (value.length < 16) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}
