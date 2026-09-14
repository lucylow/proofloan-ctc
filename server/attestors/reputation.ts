import type { AttestorProfile } from "@shared/attestors";

export type ReputationScore = {
  operatorId: string;
  reliabilityBps: number;
  availabilityBps: number;
  consistencyBps: number;
  compositeBps: number;
};

export function scoreAttestor(profile: AttestorProfile): ReputationScore {
  const reliabilityBps = Math.max(0, Math.min(10_000, profile.faultCount === 0 ? 10_000 : Math.max(0, 10_000 - profile.faultCount * 750)));
  const availabilityBps = Math.max(0, Math.min(10_000, profile.uptimeBps));
  const consistencyBps = Math.max(0, Math.min(10_000, profile.slashCount === 0 ? 10_000 : Math.max(0, 10_000 - profile.slashCount * 1_000)));
  const compositeBps = Math.floor((reliabilityBps * 45 + availabilityBps * 35 + consistencyBps * 20) / 100);
  return { operatorId: profile.operatorId, reliabilityBps, availabilityBps, consistencyBps, compositeBps };
}

export function rankAttestors(profiles: AttestorProfile[]): ReputationScore[] {
  return profiles.map(scoreAttestor).sort((a, b) => b.compositeBps - a.compositeBps || a.operatorId.localeCompare(b.operatorId));
}
