import type { AttestorProfile } from "@shared/attestors";
import type { FaultBook } from "./faults";

export type SlashResult = { operatorId: string; previousStakeAtomic: string; slashedAtomic: string; remainingStakeAtomic: string; status: AttestorProfile["status"] };

export class SlashingEngine {
  constructor(private readonly faults: FaultBook) {}

  apply(profile: AttestorProfile, faultId: string): SlashResult {
    const fault = this.faults.list().find(x => x.faultId === faultId);
    if (!fault || fault.operatorId !== profile.operatorId || !fault.confirmedAt || fault.slashBps === undefined) throw new Error("Confirmed fault required for slashing.");
    const stake = BigInt(profile.stakeAtomic);
    const slash = (stake * BigInt(fault.slashBps)) / 10_000n;
    const remaining = stake - slash;
    const status = remaining < BigInt(profile.minStakeAtomic) ? "jailed" : profile.status;
    return { operatorId: profile.operatorId, previousStakeAtomic: stake.toString(), slashedAtomic: slash.toString(), remainingStakeAtomic: remaining.toString(), status };
  }
}
