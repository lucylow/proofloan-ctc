import { describe, expect, it } from "vitest";
import { allocateAttestorRewards } from "./rewards";
import type { AttestorProfile } from "@shared/attestors";

const profiles: AttestorProfile[] = [1, 2, 3].map(n => ({ operatorId: `r${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`, blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "1000", minStakeAtomic: "1000", weightBps: 3333, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" }));

describe("Attestor rewards", () => {
  it("reconciles exactly to the reward pool", () => {
    const rewards = allocateAttestorRewards({ feeId: "fee1", amountAtomic: 1001n, activity: "proof-verification", attestors: profiles });
    expect(rewards.reduce((sum, r) => sum + BigInt(r.amountAtomic), 0n)).toBe(1001n);
  });
});
