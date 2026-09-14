import type { AttestorHealth, AttestorProfile } from "@shared/attestors";

export function buildHealth(profile: AttestorProfile, now = Date.now()): AttestorHealth {
  const lastSeen = Date.parse(profile.lastSeenAt);
  const stale = !Number.isFinite(lastSeen) || now - lastSeen > 5 * 60_000;
  return {
    operatorId: profile.operatorId,
    status: stale && profile.status === "active" ? "inactive" : profile.status,
    available: !stale && (profile.status === "active" || profile.status === "probation"),
    latencyMs: Math.max(1, Math.round((10_000 - profile.uptimeBps) / 8)),
    uptimeBps: profile.uptimeBps,
    stakeAtomic: profile.stakeAtomic,
    weightBps: profile.weightBps,
    faults24h: profile.faultCount,
    lastSeenAt: profile.lastSeenAt,
  };
}

export function summarizeHealth(profiles: AttestorProfile[]): AttestorHealth[] {
  return profiles.map(profile => buildHealth(profile));
}
