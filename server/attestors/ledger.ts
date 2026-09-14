import type { AttestorRewardAllocation } from "@shared/attestors";

export class AttestorRewardLedger {
  private readonly rewards = new Map<string, AttestorRewardAllocation>();
  append(reward: AttestorRewardAllocation): void { this.rewards.set(`${reward.feeId}:${reward.operatorId}:${reward.activity}`, { ...reward }); }
  list(operatorId?: string): AttestorRewardAllocation[] { return [...this.rewards.values()].filter(r => !operatorId || r.operatorId === operatorId).map(r => ({ ...r })); }
  accrued(operatorId?: string): bigint { return this.list(operatorId).filter(r => r.status === "accrued" || r.status === "claimable").reduce((sum, r) => sum + BigInt(r.amountAtomic), 0n); }
  mark(operatorId: string, feeId: string, status: AttestorRewardAllocation["status"]): number { let n = 0; for (const reward of this.rewards.values()) if (reward.operatorId === operatorId && reward.feeId === feeId) { reward.status = status; n += 1; } return n; }
}
