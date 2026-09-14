import type { AttestorRewardAllocation } from "@shared/attestors";

export type RewardEscrowEntry = { key: string; operatorId: string; amountAtomic: string; status: "held" | "released" | "reverted"; createdAt: string };
export class AttestorRewardEscrow {
  private readonly entries = new Map<string, RewardEscrowEntry>();
  hold(reward: AttestorRewardAllocation): RewardEscrowEntry { const key = `${reward.feeId}:${reward.operatorId}:${reward.activity}`; const entry = { key, operatorId: reward.operatorId, amountAtomic: reward.amountAtomic, status: "held" as const, createdAt: new Date().toISOString() }; this.entries.set(key, entry); return { ...entry }; }
  release(key: string): RewardEscrowEntry { const entry = this.entries.get(key); if (!entry) throw new Error("Unknown reward escrow entry."); entry.status = "released"; return { ...entry }; }
  revert(key: string): RewardEscrowEntry { const entry = this.entries.get(key); if (!entry) throw new Error("Unknown reward escrow entry."); if (entry.status === "released") throw new Error("Released reward cannot be reverted."); entry.status = "reverted"; return { ...entry }; }
  held(): RewardEscrowEntry[] { return [...this.entries.values()].filter(e => e.status === "held").map(e => ({ ...e })); }
}
