import type { AttestorProfile } from "@shared/attestors";

export type AttestorBudget = { totalStakeAtomic: bigint; activeWeightBps: number; rewardBudgetAtomic: bigint; minSafeStakeAtomic: bigint };

export function calculateBudget(profiles: AttestorProfile[], rewardBudgetAtomic: bigint): AttestorBudget {
  const eligible = profiles.filter(p => p.status === "active" || p.status === "probation");
  return {
    totalStakeAtomic: eligible.reduce((sum, p) => sum + BigInt(p.stakeAtomic), 0n),
    activeWeightBps: eligible.reduce((sum, p) => sum + p.weightBps, 0),
    rewardBudgetAtomic,
    minSafeStakeAtomic: eligible.reduce((min, p) => { const stake = BigInt(p.stakeAtomic); return min === 0n || stake < min ? stake : min; }, 0n),
  };
}
