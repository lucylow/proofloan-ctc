import type { SourceChain, VerifiedFact } from "@shared/proofloan";
import type { BlockchainObservation, VerifiedChainEvent } from "./blockchainTypes";
import type { FeatureContext } from "./featureTypes";

const CHAIN_IDS: Record<SourceChain, string> = {
  "Ethereum Sepolia": "ethereum-sepolia",
  "Ethereum Mainnet": "ethereum-mainnet",
  "Polygon Amoy": "polygon-amoy",
};

function parseAmount(amount: string): string {
  const parsed = Number.parseFloat(String(amount ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : "0";
}

function timestampMs(value: string, fallbackMs: number): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallbackMs;
}

function directionFor(eventType: VerifiedFact["eventType"]): BlockchainObservation["direction"] {
  if (eventType === "LATE_PAYMENT") return "in";
  return "out";
}

export function isAttestcoinVerifiedFact(fact: VerifiedFact): boolean {
  if (fact.evidenceMode === "mock") return false;
  if (fact.verificationStatus === "failed" || fact.verificationStatus === "stale") return false;
  if (fact.receiptStatus === "0x0") return false;
  return true;
}

export function observationFromVerifiedFact(
  fact: VerifiedFact,
  walletAddress: string,
  nowMs: number,
): BlockchainObservation {
  return {
    chainId: CHAIN_IDS[fact.chain] ?? fact.chain,
    address: walletAddress,
    blockNumber: Number.isFinite(fact.sourceBlock) ? fact.sourceBlock : 0,
    txHash: fact.txHash,
    direction: directionFor(fact.eventType),
    asset: fact.asset,
    amount: parseAmount(fact.amount),
    timestampMs: timestampMs(fact.observedAt, nowMs),
    verified: isAttestcoinVerifiedFact(fact),
    evidenceId: fact.id,
  };
}

export function eventFromVerifiedFact(
  fact: VerifiedFact,
  walletAddress: string,
  nowMs: number,
): VerifiedChainEvent {
  return {
    chainId: CHAIN_IDS[fact.chain] ?? fact.chain,
    chainKey: fact.chainKey ?? undefined,
    blockNumber: Number.isFinite(fact.sourceBlock) ? fact.sourceBlock : 0,
    blockHash: fact.merkleProofHash ?? fact.proofRoot,
    txHash: fact.txHash,
    txIndex: Number.isFinite(fact.txIndex) ? Number(fact.txIndex) : 0,
    address: walletAddress,
    topic0: fact.eventType,
    data: fact.amount,
    timestampMs: timestampMs(fact.observedAt, nowMs),
    proofRoot: fact.proofRoot,
    verified: isAttestcoinVerifiedFact(fact),
    evidenceId: fact.id,
  };
}

export function featureContextFromVerifiedFacts(
  facts: VerifiedFact[],
  nowMs = Date.now(),
  walletAddress = "unknown",
): FeatureContext {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const safeWallet = typeof walletAddress === "string" && walletAddress.trim().length > 0 ? walletAddress.trim() : "unknown";
  return {
    nowMs: safeNowMs,
    observations: safeFacts.map(fact => observationFromVerifiedFact(fact, safeWallet, safeNowMs)),
    events: safeFacts.map(fact => eventFromVerifiedFact(fact, safeWallet, safeNowMs)),
  };
}
