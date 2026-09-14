import type { ContinuityProof } from "./types";
import { sha256Hex } from "./hash";

export function calculateContinuityDigest(lower: string, roots: string[]): string {
  let digest = lower;
  for (const root of roots) digest = sha256Hex(digest + root);
  return digest;
}

export function verifyContinuity(proof: ContinuityProof, expectedUpperDigest: string): boolean {
  return calculateContinuityDigest(proof.lowerEndpointDigest, proof.roots) === expectedUpperDigest;
}

export function estimateContinuityLength(
  startBlock: bigint,
  endBlock: bigint,
  checkpointStride: number,
): number {
  if (endBlock <= startBlock) return 0;
  return Math.ceil(Number(endBlock - startBlock) / Math.max(1, checkpointStride));
}
