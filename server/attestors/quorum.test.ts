import { describe, expect, it } from "vitest";
import { calculateQuorum, assertSupermajority } from "./quorum";
import type { AttestorProfile } from "@shared/attestors";
import { deterministicTestSignature } from "./signatures";

const profiles: AttestorProfile[] = [1, 2, 3, 4, 5].map((n) => ({
  operatorId: `a${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`,
  blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active",
  stakeAtomic: "1000", minStakeAtomic: "1000", weightBps: 2000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0",
}));

describe("Attestor quorum", () => {
  it("accepts a two-thirds supermajority", () => {
    const digest = `0x${"ab".repeat(32)}`;
    const q = calculateQuorum(profiles, profiles.slice(0, 4).map(p => deterministicTestSignature(p.operatorId, digest)));
    expect(q.supermajority).toBe(true);
    assertSupermajority(q);
  });

  it("rejects a simple minority", () => {
    const digest = `0x${"cd".repeat(32)}`;
    const q = calculateQuorum(profiles, profiles.slice(0, 2).map(p => deterministicTestSignature(p.operatorId, digest)));
    expect(q.supermajority).toBe(false);
    expect(() => assertSupermajority(q)).toThrow();
  });
});
