import type { AttestorProfile } from "@shared/attestors";

export type BondChange = { operatorId: string; previousStakeAtomic: string; nextStakeAtomic: string; reason: "deposit" | "withdraw" | "slash"; at: string };

export class BondManager {
  private readonly history: BondChange[] = [];
  deposit(profile: AttestorProfile, amountAtomic: bigint): AttestorProfile {
    if (amountAtomic <= 0n) throw new Error("Stake deposit must be positive.");
    return this.change(profile, amountAtomic, "deposit");
  }
  withdraw(profile: AttestorProfile, amountAtomic: bigint): AttestorProfile {
    if (amountAtomic <= 0n) throw new Error("Stake withdrawal must be positive.");
    const current = BigInt(profile.stakeAtomic);
    if (amountAtomic >= current) throw new Error("Attestor cannot withdraw its full stake while bonded.");
    return this.change(profile, -amountAtomic, "withdraw");
  }
  private change(profile: AttestorProfile, delta: bigint, reason: BondChange["reason"]): AttestorProfile {
    const previous = BigInt(profile.stakeAtomic);
    const next = previous + delta;
    if (next < 0n) throw new Error("Stake cannot become negative.");
    this.history.push({ operatorId: profile.operatorId, previousStakeAtomic: previous.toString(), nextStakeAtomic: next.toString(), reason, at: new Date().toISOString() });
    return { ...profile, stakeAtomic: next.toString() };
  }
  list(operatorId?: string): BondChange[] { return this.history.filter(e => !operatorId || e.operatorId === operatorId).map(e => ({ ...e })); }
}
