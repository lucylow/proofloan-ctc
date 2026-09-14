export interface FreshnessInput {
  targetBlock: bigint;
  attestationBlock: bigint;
  currentBlock: bigint;
  window: number;
}

export interface FreshnessResult {
  fresh: boolean;
  ageBlocks: bigint;
  targetToAttestation: bigint;
  reason: string;
}

export function evaluateFreshness(input: FreshnessInput): FreshnessResult {
  const age = input.currentBlock - input.targetBlock;
  const lag = input.attestationBlock - input.targetBlock;
  if (input.attestationBlock < input.targetBlock) {
    return {
      fresh: false,
      ageBlocks: age,
      targetToAttestation: lag,
      reason: "ATTESTATION_PRECEDES_TARGET",
    };
  }
  if (age > BigInt(input.window)) {
    return {
      fresh: false,
      ageBlocks: age,
      targetToAttestation: lag,
      reason: "STALE_REQUEST",
    };
  }
  return { fresh: true, ageBlocks: age, targetToAttestation: lag, reason: "FRESH" };
}
