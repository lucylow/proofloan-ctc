import type { AttestorServiceSnapshot } from "@shared/attestors";

export function exportAttestorSnapshot(snapshot: AttestorServiceSnapshot): string {
  return JSON.stringify({
    schema: "proofloan.attestor.snapshot.v1",
    generatedAt: new Date().toISOString(),
    ...snapshot,
  }, null, 2);
}

export function parseAttestorSnapshot(serialized: string): AttestorServiceSnapshot {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid Attestor snapshot.");
  const input = parsed as Record<string, unknown>;
  if (input.schema !== "proofloan.attestor.snapshot.v1") throw new Error("Unsupported Attestor snapshot schema.");
  return {
    environment: input.environment === "cc3-mainnet" ? "cc3-mainnet" : "cc3-testnet",
    eligibleAttestors: Number(input.eligibleAttestors),
    activeAttestors: Number(input.activeAttestors),
    totalStakeAtomic: String(input.totalStakeAtomic),
    totalWeightBps: Number(input.totalWeightBps),
    requiredQuorumBps: Number(input.requiredQuorumBps),
    healthyAttestors: Number(input.healthyAttestors),
    pendingFaults: Number(input.pendingFaults),
    pendingRewardsAtomic: String(input.pendingRewardsAtomic),
    latestAttestationByChain: (input.latestAttestationByChain && typeof input.latestAttestationByChain === "object" ? Object.fromEntries(Object.entries(input.latestAttestationByChain as Record<string, unknown>).map(([k, v]) => [k, Number(v)])) : {}),
  };
}
