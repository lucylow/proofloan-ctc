export interface AttestationCheckpoint {
  blockNumber: bigint;
  root: string;
  recordedAt: number;
}

export function checkpointIsUsable(cp: AttestationCheckpoint, target: bigint): boolean {
  return cp.blockNumber >= target;
}
