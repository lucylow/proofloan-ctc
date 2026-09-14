import { describe, expect, it } from "vitest";
import { buildAttestationCertificate } from "./consensus";
import { buildObservation } from "./observations";
import { digestAttestationInput } from "./hash";
import { deterministicTestSignature } from "./signatures";
import type { AttestorProfile } from "@shared/attestors";

const eligible: AttestorProfile[] = [1, 2, 3, 4, 5].map((n) => ({ operatorId: `att-${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`, blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 2000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" }));

describe("Attestor consensus", () => {
  it("builds a certificate only after maturity and supermajority", () => {
    const now = new Date("2026-09-13T04:00:00.000Z");
    const observations = eligible.map(p => ({ ...buildObservation({ operatorId: p.operatorId, sourceChain: "ethereum-sepolia", sourceBlock: 100, blockHash: "0xblock", previousBlockHash: "0xprev", observedAt: new Date("2026-09-13T03:50:00.000Z"), maturityDelaySeconds: 1 }), maturityAt: "2026-09-13T03:51:00.000Z" }));
    const digest = digestAttestationInput({ environment: "cc3-testnet", sourceChain: "ethereum-sepolia", sourceBlock: 100, blockHash: "0xblock" });
    const signatures = eligible.slice(0, 4).map(p => deterministicTestSignature(p.operatorId, digest));
    const certificate = buildAttestationCertificate({ environment: "cc3-testnet", sourceChain: "ethereum-sepolia", observations, signatures, eligible }, now);
    expect(certificate.quorum.supermajority).toBe(true);
    expect(certificate.sourceBlock).toBe(100);
  });
});
