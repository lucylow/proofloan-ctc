import type { AttestorProfile } from "@shared/attestors";

export type AttestorPolicy = {
  requiredQuorumBps: number;
  minimumAttestors: number;
  minimumStakeAtomic: bigint;
  maximumObservedAgeSeconds: number;
  maximumFaultRateBps: number;
  allowProbationForQuorum: boolean;
};

export const defaultAttestorPolicy: AttestorPolicy = {
  requiredQuorumBps: 6_667,
  minimumAttestors: 2,
  minimumStakeAtomic: 1_000n,
  maximumObservedAgeSeconds: 900,
  maximumFaultRateBps: 2_000,
  allowProbationForQuorum: true,
};

export function eligibleByPolicy(profiles: AttestorProfile[], policy = defaultAttestorPolicy, now = Date.now()): AttestorProfile[] {
  return profiles.filter(profile => {
    if (profile.status === "jailed" || profile.status === "inactive") return false;
    if (!policy.allowProbationForQuorum && profile.status !== "active") return false;
    if (BigInt(profile.stakeAtomic) < policy.minimumStakeAtomic) return false;
    if (profile.weightBps <= 0) return false;
    const lastSeen = Date.parse(profile.lastSeenAt);
    if (!Number.isFinite(lastSeen) || now - lastSeen > policy.maximumObservedAgeSeconds * 1000) return false;
    const faultRate = profile.faultCount <= 0 ? 0 : Math.min(10_000, profile.faultCount * 500);
    return faultRate <= policy.maximumFaultRateBps;
  });
}

export function assertPolicySatisfied(profiles: AttestorProfile[], policy = defaultAttestorPolicy): void {
  if (profiles.length < policy.minimumAttestors) throw new Error(`Attestor policy requires at least ${policy.minimumAttestors} eligible operators.`);
  const weight = profiles.reduce((sum, p) => sum + p.weightBps, 0);
  if (weight < policy.requiredQuorumBps) throw new Error(`Eligible Attestor weight ${weight} bps is below required ${policy.requiredQuorumBps} bps.`);
}
