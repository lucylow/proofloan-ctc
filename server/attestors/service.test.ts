import { describe, expect, it } from "vitest";
import { AttestorService } from "./service";
import type { AttestorProfile } from "@shared/attestors";

const profiles: AttestorProfile[] = [1, 2, 3, 4, 5].map(n => ({ operatorId: `attestor-${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`, blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 2000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" }));

describe("Attestor service", () => {
  it("reports a healthy quorum surface", () => {
    const service = new AttestorService({ attestors: profiles });
    const snapshot = service.snapshot("cc3-testnet");
    expect(snapshot.eligibleAttestors).toBe(5);
    expect(snapshot.requiredQuorumBps).toBe(6667);
  });
});
