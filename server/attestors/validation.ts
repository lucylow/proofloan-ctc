import type { AttestorProfile, AttestorQuorum, AttestorSignature, CrossChainMessage } from "@shared/attestors";
import { attestorEnvironments, attestorStatuses } from "@shared/attestors";
import { attestorError } from "./errors";

const HEX = /^0x[a-fA-F0-9]+$/;

export function isValidOperatorId(value: string): boolean {
  return /^[A-Za-z0-9._:-]{3,96}$/.test(value);
}

export function isValidDigest(value: string): boolean {
  return /^0x[a-f0-9]{64}$/i.test(value);
}

export function isValidPublicKey(value: string): boolean {
  return HEX.test(value) && value.length >= 64;
}

export function attestorValidationIssue(profile: AttestorProfile): string | null {
  if (!isValidOperatorId(profile.operatorId)) {
    return "operatorId must be 3-96 characters of [A-Za-z0-9._:-]";
  }
  if (profile.payoutAddress.length < 10) return "payoutAddress is too short";
  if (profile.signingAddress.length < 10) return "signingAddress is too short";
  if (!isValidPublicKey(profile.blsPublicKey)) return "blsPublicKey is not a valid hex public key";
  if (!(attestorStatuses as readonly string[]).includes(profile.status)) return "status is not a known attestor status";
  if (!(attestorEnvironments as readonly string[]).includes(profile.environment)) {
    return "environment must be cc3-testnet or cc3-mainnet";
  }
  if (!Array.isArray(profile.chains) || profile.chains.length === 0) return "at least one supported chain is required";
  if (profile.chains.some(chain => typeof chain !== "string" || chain.trim().length < 3)) {
    return "chains contains an invalid chain id";
  }
  if (!Number.isInteger(profile.weightBps) || profile.weightBps < 0 || profile.weightBps > 10_000) {
    return "weightBps must be an integer between 0 and 10000";
  }
  if (!/^\d+$/.test(profile.stakeAtomic) || !/^\d+$/.test(profile.minStakeAtomic)) {
    return "stakeAtomic and minStakeAtomic must be integer strings";
  }
  if (BigInt(profile.stakeAtomic) < BigInt(profile.minStakeAtomic)) {
    return "stakeAtomic is below minStakeAtomic";
  }
  if (!Number.isInteger(profile.uptimeBps) || profile.uptimeBps < 0 || profile.uptimeBps > 10_000) {
    return "uptimeBps must be an integer between 0 and 10000";
  }
  if (!Number.isInteger(profile.faultCount) || profile.faultCount < 0) return "faultCount must be a non-negative integer";
  if (!Number.isInteger(profile.slashCount) || profile.slashCount < 0) return "slashCount must be a non-negative integer";
  if (!/^\d+$/.test(profile.rewardAtomic)) return "rewardAtomic must be an integer string";
  return null;
}

export function isValidAttestor(profile: AttestorProfile): boolean {
  return attestorValidationIssue(profile) === null;
}

export function validateSignature(signature: AttestorSignature): void {
  if (!isValidOperatorId(signature.operatorId)) throw attestorError("VALIDATION", "Invalid Attestor operator ID.");
  if (!isValidDigest(signature.signedDigest)) throw attestorError("VALIDATION", "Invalid Attestor signed digest.");
  if (!isValidPublicKey(signature.publicKey)) throw attestorError("VALIDATION", "Invalid Attestor public key.");
  if (!HEX.test(signature.signature)) throw attestorError("VALIDATION", "Invalid Attestor signature encoding.");
}

export function validateQuorum(quorum: AttestorQuorum): void {
  if (quorum.requiredBps < 5_001) throw attestorError("VALIDATION", "Attestor quorum must be a supermajority.");
  if (quorum.observedWeightBps < 0 || quorum.observedWeightBps > 10_000) {
    throw attestorError("VALIDATION", "Invalid observed quorum weight.");
  }
  if (quorum.totalEligibleWeightBps < quorum.observedWeightBps) {
    throw attestorError("VALIDATION", "Observed quorum cannot exceed eligible weight.");
  }
  if (quorum.supermajority !== (quorum.observedWeightBps >= quorum.requiredBps)) {
    throw attestorError("VALIDATION", "Attestor quorum supermajority flag is inconsistent.");
  }
}

export function validateCrossChainMessage(message: CrossChainMessage): void {
  if (!message.messageId || message.messageId.length > 128) {
    throw attestorError("VALIDATION", "Invalid cross-chain message ID.");
  }
  if (!message.originChain || !message.destinationChain) {
    throw attestorError("VALIDATION", "Cross-chain message requires origin and destination chains.");
  }
  if (!message.emitter || message.emitter.length < 10) {
    throw attestorError("VALIDATION", "Cross-chain message requires an emitter.");
  }
  if (!HEX.test(message.payloadHex)) {
    throw attestorError("VALIDATION", "Cross-chain message payload must be hex encoded.");
  }
  if (!/^\d+$/.test(message.nonce)) {
    throw attestorError("VALIDATION", "Cross-chain message nonce must be numeric.");
  }
}
