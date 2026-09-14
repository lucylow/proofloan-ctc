import { describe, expect, it } from "vitest";
import { attestMessage, createCrossChainMessage } from "./message";
import { digestMessageInput } from "./hash";
import { deterministicTestSignature } from "./signatures";
import type { AttestorProfile } from "@shared/attestors";

const eligible: AttestorProfile[] = [1, 2, 3, 4, 5].map((n) => ({ operatorId: `msg-att-${n}`, payoutAddress: `0x${String(n).repeat(40)}`, signingAddress: `0x${String(n + 1).repeat(40)}`, blsPublicKey: `0x${String(n + 2).repeat(96)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 2000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" }));

describe("Attestor message signing", () => {
  it("binds message ID, endpoints, emitter, payload, and nonce", () => {
    const message = createCrossChainMessage({ originChain: "creditcoin", destinationChain: "ethereum-sepolia", emitter: "0x1111111111111111111111111111111111111111", payloadHex: "0x1234", acknowledgementRequired: true, nonce: "7" });
    const digest = digestMessageInput({ messageId: message.messageId, originChain: message.originChain, destinationChain: message.destinationChain, emitter: message.emitter, payloadHex: message.payloadHex, nonce: message.nonce });
    const signatures = eligible.slice(0, 4).map(p => deterministicTestSignature(p.operatorId, digest));
    const attestation = attestMessage(message, signatures, eligible);
    expect(attestation.quorum.supermajority).toBe(true);
    expect(attestation.digest).toBe(digest);
  });
});
