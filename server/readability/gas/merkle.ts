export function expectedMerkleSiblings(transactionCount: number): number {
  if (!Number.isSafeInteger(transactionCount) || transactionCount <= 0) return 0;
  return Math.ceil(Math.log2(transactionCount)) + 1;
}

export function merkleComplexityScore(transactionCount: number): number {
  return Math.max(0, expectedMerkleSiblings(transactionCount));
}
