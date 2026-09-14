import { describe, expect, it } from "vitest";
import { AttestorOutbox } from "./outbox";
import { AttestorInbox } from "./inbox";
import { DeliveryBook } from "./delivery";
import { MessagePipeline } from "./messagePipeline";
import { payloadHash, normalizePayload } from "./payload";
import { calculateBackoff } from "./backoff";
import { classifyFreshness } from "./freshness";
import { QuorumHistory } from "./quorumHistory";
import { policyHash } from "./policyHash";
import { defaultAttestorPolicy } from "./policy";
import { createCrossChainMessage } from "./message";

describe("advanced Attestor helpers", () => {
  it("normalizes payloads", () => expect(normalizePayload("0xABCD")).toBe("0xabcd"));
  it("hashes payloads deterministically", () => expect(payloadHash("0xabcd")).toBe(payloadHash("0xabcd")));
  it("calculates bounded backoff", () => expect(calculateBackoff(100)).toBeLessThanOrEqual(10000));
  it("classifies freshness", () => expect(classifyFreshness(new Date().toISOString())).toBe("fresh"));
  it("hashes policy", () => expect(policyHash(defaultAttestorPolicy)).toMatch(/^0x/));
  it("records quorum history", () => { const h = new QuorumHistory(); h.record({ at: new Date().toISOString(), chain: "x", weightBps: 8000, signerCount: 4, thresholdBps: 6667 }); expect(h.average("x")).toBe(8000); });
  it("publishes and reads inbox records", () => { const outbox = new AttestorOutbox(); const msg = outbox.publish({ senderNamespace: "loan", originChain: "creditcoin", destinationChain: "ethereum-sepolia", emitter: "0x1111111111111111111111111111111111111111", payloadHex: "0x00", acknowledgementRequired: true }); expect(outbox.get(msg.messageId)?.messageId).toBe(msg.messageId); });
  it("tracks delivery retries", () => { const message = createCrossChainMessage({ originChain: "creditcoin", destinationChain: "ethereum-sepolia", emitter: "0x1111111111111111111111111111111111111111", payloadHex: "0x00", acknowledgementRequired: true, nonce: "1" }); const inbox = new AttestorInbox(); expect(inbox.pending()).toHaveLength(0); const delivery = new DeliveryBook(); const dummy: any = { message, digest: "0x" + "aa".repeat(32), signatures: [], quorum: { requiredBps: 6667, observedWeightBps: 6667, signerCount: 2, totalEligibleWeightBps: 10000, supermajority: true } }; inbox.accept(dummy); delivery.record(dummy, "relayer-1", false); expect(delivery.get(message.messageId)?.attempts).toBe(1); });
  it("creates a pipeline", () => { const message = createCrossChainMessage({ originChain: "creditcoin", destinationChain: "ethereum-sepolia", emitter: "0x1111111111111111111111111111111111111111", payloadHex: "0x00", acknowledgementRequired: true, nonce: "1" }); const pipeline = new MessagePipeline(message); expect(pipeline.markPending("temporary").stage).toBe("pending"); });
});
