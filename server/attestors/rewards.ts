import type { AttestorProfile, AttestorRewardAllocation } from "@shared/attestors";

export type RewardInput = {
  feeId: string;
  amountAtomic: bigint;
  activity: "proof-verification" | "message-carry" | "both";
  attestors: AttestorProfile[];
};

export function allocateAttestorRewards(input: RewardInput): AttestorRewardAllocation[] {
  const eligible = input.attestors.filter(p => p.status === "active" || p.status === "probation");
  if (eligible.length === 0) return [];
  const totalWeight = eligible.reduce((sum, p) => sum + p.weightBps, 0);
  if (totalWeight <= 0) throw new Error("Attestor reward allocation requires positive weight.");
  let allocated = 0n;
  return eligible.map((attestor, index) => {
    const amount = index === eligible.length - 1 ? input.amountAtomic - allocated : (input.amountAtomic * BigInt(attestor.weightBps)) / BigInt(totalWeight);
    allocated += amount;
    return { operatorId: attestor.operatorId, activity: input.activity, amountAtomic: amount.toString(), status: "accrued", feeId: input.feeId };
  });
}
