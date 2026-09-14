import { randomUUID } from "node:crypto";
import type { AtcOperatorAllocation, AtcOperatorReward } from "@shared/atc";
import { addAtomic } from "@shared/atc";
import { AtcError } from "./errors";
import type { AtcLedger } from "./ledger";

export function createClaimableRewards(
  feeId: string,
  actionId: string,
  allocations: AtcOperatorAllocation[],
): AtcOperatorReward[] {
  const createdAt = new Date().toISOString();
  return allocations.map(allocation => ({
    rewardId: `atc_rw_${randomUUID().replaceAll("-", "")}`,
    feeId,
    actionId,
    operatorId: allocation.operatorId,
    amountAtomic: allocation.amountAtomic,
    status: "claimable",
    createdAt,
  }));
}

export function claimOperatorReward(ledger: AtcLedger, rewardId: string): AtcOperatorReward {
  for (const [feeId, rewards] of groupByFee(ledger)) {
    const index = rewards.findIndex(reward => reward.rewardId === rewardId);
    if (index < 0) continue;
    const reward = rewards[index]!;
    if (reward.status === "claimed") return reward;
    if (reward.status !== "claimable") {
      throw new AtcError("VALIDATION", "ATC operator reward is not claimable.");
    }
    const claimed: AtcOperatorReward = {
      ...reward,
      status: "claimed",
      claimedAt: new Date().toISOString(),
    };
    const next = [...rewards];
    next[index] = claimed;
    ledger.replaceRewards(feeId, next);
    return claimed;
  }
  throw new AtcError("VALIDATION", "ATC operator reward was not found.");
}

export function operatorClaimSummary(ledger: AtcLedger): {
  claimableAtomic: string;
  claimedAtomic: string;
  byOperator: Record<string, { claimableAtomic: string; claimedAtomic: string }>;
} {
  const byOperator: Record<string, { claimableAtomic: string; claimedAtomic: string }> = {};
  let claimableAtomic = "0";
  let claimedAtomic = "0";
  for (const reward of ledger.listRewards()) {
    const current = byOperator[reward.operatorId] ?? { claimableAtomic: "0", claimedAtomic: "0" };
    if (reward.status === "claimed") {
      current.claimedAtomic = addAtomic(current.claimedAtomic, reward.amountAtomic);
      claimedAtomic = addAtomic(claimedAtomic, reward.amountAtomic);
    } else {
      current.claimableAtomic = addAtomic(current.claimableAtomic, reward.amountAtomic);
      claimableAtomic = addAtomic(claimableAtomic, reward.amountAtomic);
    }
    byOperator[reward.operatorId] = current;
  }
  return { claimableAtomic, claimedAtomic, byOperator };
}

function groupByFee(ledger: AtcLedger): Array<[string, AtcOperatorReward[]]> {
  const seen = new Set<string>();
  const grouped: Array<[string, AtcOperatorReward[]]> = [];
  for (const reward of ledger.listRewards()) {
    if (seen.has(reward.feeId)) continue;
    seen.add(reward.feeId);
    grouped.push([reward.feeId, ledger.getRewards(reward.feeId)]);
  }
  return grouped;
}
