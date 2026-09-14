import type { AttestorProfile, AttestorSignature, CrossChainMessage, MessageAttestation } from "@shared/attestors";
import { randomUUID } from "node:crypto";
import { digestMessageInput, sha256Hex } from "./hash";
import { assertSupermajority, calculateQuorum } from "./quorum";
import { validateCrossChainMessage } from "./validation";

export function createCrossChainMessage(input: Omit<CrossChainMessage, "messageId" | "createdAt">): CrossChainMessage {
  const message: CrossChainMessage = { ...input, messageId: `msg_${randomUUID().replaceAll("-", "")}`, createdAt: new Date().toISOString() };
  validateCrossChainMessage(message);
  return message;
}

export function attestMessage(message: CrossChainMessage, signatures: AttestorSignature[], eligible: AttestorProfile[], requiredQuorumBps = 6_667): MessageAttestation {
  validateCrossChainMessage(message);
  const digest = digestMessageInput({
    messageId: message.messageId,
    originChain: message.originChain,
    destinationChain: message.destinationChain,
    emitter: message.emitter,
    payloadHex: message.payloadHex,
    nonce: message.nonce,
  });
  const matching = signatures.filter(s => s.signedDigest === digest);
  const quorum = calculateQuorum(eligible, matching, requiredQuorumBps);
  assertSupermajority(quorum);
  return {
    message: structuredClone(message),
    digest,
    signatures: matching.map(s => ({ ...s })),
    aggregateSignature: `0xaggregate_${sha256Hex(matching).slice(2, 26)}`,
    quorum,
  };
}
