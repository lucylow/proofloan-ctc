import { describe, expect, it } from "vitest";
import { AttestorRuntime } from "./runtime";
import type { AttestorProfile } from "@shared/attestors";

const profiles: AttestorProfile[] = [1, 2, 3, 4, 5].map(n => ({ operatorId: `runtime-${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`, blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia", "ethereum-mainnet"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 2000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" }));

describe("AttestorRuntime", () => {
  it("polls the network", () => { const runtime = new AttestorRuntime(profiles, { environment: "cc3-testnet" }); expect(runtime.poll().snapshot.healthyAttestors).toBe(5); });
  it("publishes a cross-chain message", () => { const runtime = new AttestorRuntime(profiles, { environment: "cc3-testnet" }); const m = runtime.publish({ senderNamespace: "loan", originChain: "creditcoin", destinationChain: "ethereum-sepolia", emitter: "0x1111111111111111111111111111111111111111", payloadHex: "0x01", acknowledgementRequired: true }); expect(m.nonce).toBe("0"); });
  it("reports low risk with a full operator set", () => { const runtime = new AttestorRuntime(profiles, { environment: "cc3-testnet" }); expect(runtime.riskScore()).toBe(0); });
});
