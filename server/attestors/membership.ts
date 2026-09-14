import type { AttestorProfile } from "@shared/attestors";

export type MembershipRule = { minStakeAtomic: bigint; minUptimeBps: number; minWeightBps: number };
export const defaultMembershipRule: MembershipRule = { minStakeAtomic: 1000n, minUptimeBps: 9000, minWeightBps: 1 };

export function passesMembership(profile: AttestorProfile, rule = defaultMembershipRule): boolean {
  return BigInt(profile.stakeAtomic) >= rule.minStakeAtomic && profile.uptimeBps >= rule.minUptimeBps && profile.weightBps >= rule.minWeightBps && (profile.status === "active" || profile.status === "probation");
}

export function enforceMembership(profiles: AttestorProfile[], rule = defaultMembershipRule): AttestorProfile[] { return profiles.filter(p => passesMembership(p, rule)).map(p => ({ ...p })); }
