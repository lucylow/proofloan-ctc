export function walletAgeDays(firstSeenMs: number | undefined, nowMs: number): number {
  if (!firstSeenMs || firstSeenMs > nowMs) return 0;
  return Math.floor((nowMs - firstSeenMs) / 86_400_000);
}
