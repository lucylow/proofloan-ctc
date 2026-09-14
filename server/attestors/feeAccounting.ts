import type { AttestorRewardAllocation } from "@shared/attestors";

export type AttestorFeeAccounting = {
  feeId: string;
  attestorPoolAtomic: string;
  allocatedAtomic: string;
  unallocatedAtomic: string;
  rewardCount: number;
};

export function reconcileAttestorFee(feeId: string, poolAtomic: bigint, rewards: AttestorRewardAllocation[]): AttestorFeeAccounting {
  const selected = rewards.filter(r => r.feeId === feeId);
  const allocated = selected.reduce((sum, r) => sum + BigInt(r.amountAtomic), 0n);
  if (allocated > poolAtomic) throw new Error("Attestor allocations exceed fee pool.");
  return { feeId, attestorPoolAtomic: poolAtomic.toString(), allocatedAtomic: allocated.toString(), unallocatedAtomic: (poolAtomic - allocated).toString(), rewardCount: selected.length };
}
