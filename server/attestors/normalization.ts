import type { AttestorProfile } from "@shared/attestors";

export function normalizeAttestorProfile(input: Partial<AttestorProfile> & Pick<AttestorProfile, "operatorId">): AttestorProfile {
  const now = new Date().toISOString();
  return {
    operatorId: input.operatorId.trim(),
    payoutAddress: String(input.payoutAddress ?? ""),
    signingAddress: String(input.signingAddress ?? ""),
    blsPublicKey: String(input.blsPublicKey ?? ""),
    environment: input.environment === "cc3-mainnet" ? "cc3-mainnet" : "cc3-testnet",
    chains: [...new Set((input.chains ?? []).map(String))].sort(),
    status: input.status ?? "inactive",
    stakeAtomic: String(input.stakeAtomic ?? "0"),
    minStakeAtomic: String(input.minStakeAtomic ?? "0"),
    weightBps: Number.isFinite(input.weightBps) ? Math.max(0, Math.floor(input.weightBps!)) : 0,
    joinedAt: input.joinedAt ?? now,
    lastSeenAt: input.lastSeenAt ?? now,
    uptimeBps: Number.isFinite(input.uptimeBps) ? Math.max(0, Math.min(10_000, Math.floor(input.uptimeBps!))) : 0,
    faultCount: Number.isFinite(input.faultCount) ? Math.max(0, Math.floor(input.faultCount!)) : 0,
    slashCount: Number.isFinite(input.slashCount) ? Math.max(0, Math.floor(input.slashCount!)) : 0,
    rewardAtomic: String(input.rewardAtomic ?? "0"),
  };
}

export function publicAttestorView(profile: AttestorProfile): Omit<AttestorProfile, "blsPublicKey" | "signingAddress"> & { identityDigest: string } {
  const identityDigest = `0x${Buffer.from(profile.operatorId).toString("hex").padEnd(64, "0").slice(0, 64)}`;
  const { blsPublicKey: _b, signingAddress: _s, ...safe } = profile;
  return { ...safe, identityDigest };
}
