import type { AttestorRewardAllocation } from "@shared/attestors";

export type AttestorClaim = { claimId: string; operatorId: string; amountAtomic: string; feeIds: string[]; status: "claimable" | "submitted" | "paid" | "failed" };

export class AttestorClaimBook {
  private readonly claims = new Map<string, AttestorClaim>();

  create(operatorId: string, rewards: AttestorRewardAllocation[]): AttestorClaim | null {
    const claimable = rewards.filter(r => r.operatorId === operatorId && (r.status === "accrued" || r.status === "claimable"));
    if (claimable.length === 0) return null;
    const amount = claimable.reduce((sum, r) => sum + BigInt(r.amountAtomic), 0n);
    const claim: AttestorClaim = { claimId: `claim_att_${operatorId}_${Date.now()}`, operatorId, amountAtomic: amount.toString(), feeIds: claimable.map(r => r.feeId), status: "claimable" };
    this.claims.set(claim.claimId, claim);
    return { ...claim };
  }

  mark(claimId: string, status: AttestorClaim["status"]): AttestorClaim {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error("Unknown Attestor reward claim.");
    claim.status = status;
    return { ...claim };
  }

  list(operatorId?: string): AttestorClaim[] { return [...this.claims.values()].filter(c => !operatorId || c.operatorId === operatorId).map(c => ({ ...c, feeIds: [...c.feeIds] })); }
}
