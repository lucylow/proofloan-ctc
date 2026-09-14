import type { AttestorProfile } from "@shared/attestors";

function envInt(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer in ${min}..${max}.`);
  return n;
}

export function configuredAttestorPolicy() {
  return {
    requiredQuorumBps: envInt("ATTESTOR_REQUIRED_QUORUM_BPS", 6667, 5001, 10000),
    minimumAttestors: envInt("ATTESTOR_MINIMUM_COUNT", 2, 1, 100),
    minimumStakeAtomic: BigInt(process.env.ATTESTOR_MIN_STAKE_ATOMIC ?? "1000"),
    maximumObservedAgeSeconds: envInt("ATTESTOR_MAX_OBSERVED_AGE_SECONDS", 900, 30, 86_400),
    maximumFaultRateBps: envInt("ATTESTOR_MAX_FAULT_RATE_BPS", 2000, 0, 10_000),
    allowProbationForQuorum: process.env.ATTESTOR_ALLOW_PROBATION !== "false",
  } as const;
}

export function configuredAttestors(): AttestorProfile[] {
  const raw = process.env.ATTESTORS_JSON;
  if (!raw) return demoAttestors();
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("ATTESTORS_JSON must be an array.");
  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`ATTESTOR ${index} is invalid.`);
    const p = item as Record<string, unknown>;
    if (typeof p.operatorId !== "string" || typeof p.payoutAddress !== "string" || typeof p.signingAddress !== "string" || typeof p.blsPublicKey !== "string") throw new Error(`ATTESTOR ${index} is missing required identity fields.`);
    return {
      operatorId: p.operatorId,
      payoutAddress: p.payoutAddress,
      signingAddress: p.signingAddress,
      blsPublicKey: p.blsPublicKey,
      environment: p.environment === "cc3-mainnet" ? "cc3-mainnet" : "cc3-testnet",
      chains: Array.isArray(p.chains) ? p.chains.filter((x): x is string => typeof x === "string") : [],
      status: p.status === "jailed" || p.status === "inactive" || p.status === "probation" ? p.status : "active",
      stakeAtomic: String(p.stakeAtomic ?? "100000"),
      minStakeAtomic: String(p.minStakeAtomic ?? "1000"),
      weightBps: Number(p.weightBps ?? 0),
      joinedAt: String(p.joinedAt ?? new Date().toISOString()),
      lastSeenAt: String(p.lastSeenAt ?? new Date().toISOString()),
      uptimeBps: Number(p.uptimeBps ?? 10000),
      faultCount: Number(p.faultCount ?? 0),
      slashCount: Number(p.slashCount ?? 0),
      rewardAtomic: String(p.rewardAtomic ?? "0"),
    } as AttestorProfile;
  });
}

function demoAttestors(): AttestorProfile[] {
  const now = new Date().toISOString();
  return [1, 2, 3, 4, 5].map((n) => ({
    operatorId: `attestor-demo-${String(n).padStart(2, "0")}`,
    payoutAddress: `0x${String(n).repeat(40).slice(0, 40)}`,
    signingAddress: `0x${String(n + 1).repeat(40).slice(0, 40)}`,
    blsPublicKey: `0x${String(n + 2).repeat(96).slice(0, 96)}`,
    environment: "cc3-testnet" as const,
    chains: ["ethereum-sepolia", "ethereum-mainnet"],
    status: "active" as const,
    stakeAtomic: "100000",
    minStakeAtomic: "1000",
    weightBps: 2000,
    joinedAt: now,
    lastSeenAt: now,
    uptimeBps: 9950,
    faultCount: 0,
    slashCount: 0,
    rewardAtomic: "0",
  }));
}
