import { createHash, randomUUID } from "node:crypto";
import {
  canonicalAtcJson,
  formatAtomic,
  parseAtomic,
  splitAtcFee,
  type AtcActionKind,
  type AtcChainId,
  type AtcEnvironment,
  type AtcFeePolicy,
  type AtcFreeReadQuoteInput,
  type AtcPriority,
  type AtcQuote,
  type AtcQuoteActionFeeInput,
  type AtcQuoteKind,
} from "@shared/atc";
import { AtcError } from "./errors";

export function hashAtcPayload(payload: unknown): string {
  return `0x${createHash("sha256").update(canonicalAtcJson(payload)).digest("hex")}`;
}

export function payloadByteLength(payload: unknown): number {
  return Buffer.byteLength(canonicalAtcJson(payload), "utf8");
}

export function hashAtcIntegrity(value: unknown): string {
  return `0x${createHash("sha256").update(canonicalAtcJson(value)).digest("hex")}`;
}

function createQuoteId(): string {
  return `atc_q_${randomUUID().replaceAll("-", "")}`;
}

function clampAtomic(value: bigint, min: bigint, max: bigint): bigint {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function buildQuote(input: {
  kind: AtcQuoteKind;
  environment: AtcEnvironment;
  sender?: string;
  sourceChain: AtcChainId;
  destinationChain: AtcChainId;
  actionKind: AtcActionKind;
  payloadHash: string;
  proofCount: number;
  priority: AtcPriority;
  policy: AtcFeePolicy;
  totalAtomic: string;
  now: Date;
}): AtcQuote {
  const fee = splitAtcFee(
    input.totalAtomic,
    input.policy.operatorRewardBps,
    input.policy.burnBps,
    input.policy.treasuryBps,
  );
  const createdAt = input.now.toISOString();
  const expiresAt = new Date(input.now.getTime() + input.policy.quoteTtlSeconds * 1_000).toISOString();
  const quoteId = createQuoteId();
  const quote: AtcQuote = {
    quoteId,
    kind: input.kind,
    environment: input.environment,
    sender: input.sender,
    sourceChain: input.sourceChain,
    destinationChain: input.destinationChain,
    actionKind: input.actionKind,
    payloadHash: input.payloadHash,
    proofCount: input.proofCount,
    priority: input.priority,
    pricingVersion: input.policy.pricingVersion,
    fee,
    totalAtomic: fee.totalAtomic,
    operatorRewardAtomic: fee.operatorRewardAtomic,
    burnAtomic: fee.burnAtomic,
    treasuryAtomic: fee.treasuryAtomic,
    integrityHash: "0x",
    expiresAt,
    createdAt,
  };
  quote.integrityHash = hashAtcIntegrity({
    quoteId,
    kind: quote.kind,
    environment: quote.environment,
    sourceChain: quote.sourceChain,
    destinationChain: quote.destinationChain,
    actionKind: quote.actionKind,
    payloadHash: quote.payloadHash,
    proofCount: quote.proofCount,
    priority: quote.priority,
    pricingVersion: quote.pricingVersion,
    fee: quote.fee,
    expiresAt: quote.expiresAt,
  });
  return quote;
}

export function quoteFreeRead(
  input: AtcFreeReadQuoteInput,
  policy: AtcFeePolicy,
  sourceChain: AtcChainId,
  destinationChain: AtcChainId,
  now = new Date(),
): AtcQuote {
  return buildQuote({
    kind: "read",
    environment: input.environment,
    sourceChain,
    destinationChain,
    actionKind: input.actionKind,
    payloadHash: hashAtcPayload({ kind: "read", environment: input.environment }),
    proofCount: 0,
    priority: "standard",
    policy,
    totalAtomic: "0",
    now,
  });
}

export function quoteActionFee(
  input: AtcQuoteActionFeeInput,
  policy: AtcFeePolicy,
  sourceChain: AtcChainId,
  destinationChain: AtcChainId,
  now = new Date(),
): AtcQuote {
  const payloadHash = hashAtcPayload(input.payload);
  const bytes = payloadByteLength(input.payload);
  let total =
    parseAtomic(policy.baseActionFeeAtomic) +
    BigInt(bytes) * parseAtomic(policy.payloadByteFeeAtomic) +
    BigInt(input.proofCount) * parseAtomic(policy.proofFeeAtomic);
  if (input.priority === "fast") {
    total = (total * BigInt(policy.fastMultiplierBps)) / 10_000n;
  }
  total = clampAtomic(
    total,
    parseAtomic(policy.minActionFeeAtomic),
    parseAtomic(policy.maxActionFeeAtomic),
  );
  if (total <= 0n) {
    throw new AtcError("POLICY", "Cross-chain actions must produce a positive ATC fee.");
  }
  return buildQuote({
    kind: "action",
    environment: input.environment,
    sender: input.sender,
    sourceChain,
    destinationChain,
    actionKind: input.actionKind,
    payloadHash,
    proofCount: input.proofCount,
    priority: input.priority,
    policy,
    totalAtomic: formatAtomic(total),
    now,
  });
}
