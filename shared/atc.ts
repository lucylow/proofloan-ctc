import { z } from "zod";
import { attestcoinSourceChains } from "./attestcoin";

export const ATC_TOKEN_SYMBOL = "ATC";
export const ATC_BPS_DENOMINATOR = 10_000;
export const ATC_MINTED_ATOMIC = "0";

export const atcEnvironments = ["cc3-testnet", "cc3-mainnet"] as const;
export type AtcEnvironment = (typeof atcEnvironments)[number];

export const atcActionKinds = [
  "cross-chain-message",
  "credit-execution",
  "state-sync",
] as const;
export type AtcActionKind = (typeof atcActionKinds)[number];

export const atcPriorities = ["standard", "fast"] as const;
export type AtcPriority = (typeof atcPriorities)[number];

export const atcIntegrationModes = ["simulated", "external"] as const;
export type AtcIntegrationMode = (typeof atcIntegrationModes)[number];

export const atcQuoteKinds = ["read", "action"] as const;
export type AtcQuoteKind = (typeof atcQuoteKinds)[number];

export const atcFeeStatuses = ["reserved", "settled", "expired", "failed"] as const;
export type AtcFeeStatus = (typeof atcFeeStatuses)[number];

export const atcRewardStatuses = ["allocated", "claimable", "claimed"] as const;
export type AtcRewardStatus = (typeof atcRewardStatuses)[number];

export const atcReceiptStatuses = ["prepared", "settled", "failed"] as const;
export type AtcReceiptStatus = (typeof atcReceiptStatuses)[number];

export const atcLocalChainId = "creditcoin";

export const atcExternalChains = {
  "ethereum-sepolia": {
    id: "ethereum-sepolia",
    label: "Ethereum Sepolia",
    sourceChain: "Ethereum Sepolia",
  },
  "ethereum-mainnet": {
    id: "ethereum-mainnet",
    label: "Ethereum Mainnet",
    sourceChain: "Ethereum Mainnet",
  },
  "polygon-amoy": {
    id: "polygon-amoy",
    label: "Polygon Amoy",
    sourceChain: "Polygon Amoy",
  },
} as const;

export type AtcExternalChainId = keyof typeof atcExternalChains;
export type AtcChainId = typeof atcLocalChainId | AtcExternalChainId;

export const atcChainIds = [
  "creditcoin",
  "ethereum-sepolia",
  "ethereum-mainnet",
  "polygon-amoy",
] as const;

const CHAIN_ALIASES: Record<string, AtcChainId> = {
  creditcoin: "creditcoin",
  "creditcoin-testnet": "creditcoin",
  "cc3-testnet": "creditcoin",
  "cc3-mainnet": "creditcoin",
  "ethereum-sepolia": "ethereum-sepolia",
  "ethereum sepolia": "ethereum-sepolia",
  "ethereum-mainnet": "ethereum-mainnet",
  "ethereum mainnet": "ethereum-mainnet",
  "polygon-amoy": "polygon-amoy",
  "polygon amoy": "polygon-amoy",
};

export function normalizeAtcChain(value: string): AtcChainId {
  const trimmed = value.trim();
  const aliased = CHAIN_ALIASES[trimmed.toLowerCase()];
  if (aliased) return aliased;
  if ((attestcoinSourceChains as readonly string[]).includes(trimmed)) {
    const match = Object.values(atcExternalChains).find(chain => chain.sourceChain === trimmed);
    if (match) return match.id;
  }
  throw new Error(`Unsupported ATC chain: ${trimmed}`);
}

export function isAtcChainId(value: string): value is AtcChainId {
  try {
    normalizeAtcChain(value);
    return true;
  } catch {
    return false;
  }
}

export function isLocalAtcChain(value: string): boolean {
  return normalizeAtcChain(value) === atcLocalChainId;
}

export type AtcFeePolicy = {
  pricingVersion: string;
  decimals: number;
  baseActionFeeAtomic: string;
  payloadByteFeeAtomic: string;
  proofFeeAtomic: string;
  fastMultiplierBps: number;
  operatorRewardBps: number;
  burnBps: number;
  treasuryBps: number;
  minActionFeeAtomic: string;
  maxActionFeeAtomic: string;
  quoteTtlSeconds: number;
  disclaimer: string;
};

export type AtcOperator = {
  operatorId: string;
  name: string;
  weight: number;
  address: string;
};

export type AtcFeeSplit = {
  totalAtomic: string;
  operatorRewardAtomic: string;
  burnAtomic: string;
  treasuryAtomic: string;
};

export type AtcQuote = {
  quoteId: string;
  kind: AtcQuoteKind;
  environment: AtcEnvironment;
  sender?: string;
  sourceChain: AtcChainId;
  destinationChain: AtcChainId;
  actionKind: AtcActionKind;
  payloadHash: string;
  proofCount: number;
  priority: AtcPriority;
  pricingVersion: string;
  fee: AtcFeeSplit;
  totalAtomic: string;
  operatorRewardAtomic: string;
  burnAtomic: string;
  treasuryAtomic: string;
  integrityHash: string;
  expiresAt: string;
  createdAt: string;
};

export type AtcActionEnvelope = {
  actionId: string;
  nonce: string;
  environment: AtcEnvironment;
  sender: string;
  sourceChain: AtcChainId;
  destinationChain: AtcChainId;
  actionKind: AtcActionKind;
  payload: Record<string, unknown>;
  payloadHash: string;
  proofCount: number;
  priority: AtcPriority;
  idempotencyKey: string;
  quoteId: string;
  createdAt: string;
};

export type AtcPaymentInstruction = {
  adapter: AtcIntegrationMode;
  token: typeof ATC_TOKEN_SYMBOL;
  amountAtomic: string;
  paymentReference: string;
  destination: string;
  memo: string;
  minting: false;
};

export type AtcOperatorAllocation = {
  operatorId: string;
  name: string;
  address: string;
  weight: number;
  amountAtomic: string;
};

export type AtcFeeRecord = {
  feeId: string;
  quoteId: string;
  actionId: string;
  idempotencyKey: string;
  requestFingerprint: string;
  status: AtcFeeStatus;
  totalAtomic: string;
  operatorRewardAtomic: string;
  burnAtomic: string;
  treasuryAtomic: string;
  paymentReference?: string;
  protocolReference?: string;
  createdAt: string;
  settledAt?: string;
};

export type AtcOperatorReward = {
  rewardId: string;
  feeId: string;
  actionId: string;
  operatorId: string;
  amountAtomic: string;
  status: AtcRewardStatus;
  createdAt: string;
  claimedAt?: string;
};

export type AtcActionReceipt = {
  receiptId: string;
  actionId: string;
  quoteId: string;
  feeId: string;
  status: AtcReceiptStatus;
  paymentReference: string;
  protocolReference?: string;
  totalAtomic: string;
  operatorRewardAtomic: string;
  burnAtomic: string;
  treasuryAtomic: string;
  mintedAtomic: typeof ATC_MINTED_ATOMIC;
  settledAt?: string;
  createdAt: string;
};

export type AtcPreparedAction = {
  action: AtcActionEnvelope;
  quote: AtcQuote;
  payment: AtcPaymentInstruction;
  fee: AtcFeeRecord;
  operatorAllocations: AtcOperatorAllocation[];
};

export type AtcAuditEvent = {
  eventId: string;
  kind: string;
  quoteId?: string;
  actionId?: string;
  feeId?: string;
  detail: string;
  previousHash: string;
  eventHash: string;
  createdAt: string;
};

export type AtcMetricsSnapshot = {
  quotesIssued: number;
  readQuotesIssued: number;
  actionsPrepared: number;
  actionsSettled: number;
  reservedFees: number;
  paidVolumeAtomic: string;
  burnedVolumeAtomic: string;
  operatorRewardsAtomic: string;
  treasuryVolumeAtomic: string;
  mintedAtomic: typeof ATC_MINTED_ATOMIC;
};

export type AtcHealth = {
  mode: AtcIntegrationMode;
  pricingVersion: string;
  policyHealthy: boolean;
  adapterReady: boolean;
  liveProtocolEnabled: boolean;
  operators: number;
  mintingEnabled: false;
  message?: string;
};

export type AtcCapabilities = {
  freeReads: true;
  paidActions: true;
  minting: false;
  actionKinds: readonly AtcActionKind[];
  environments: readonly AtcEnvironment[];
  chains: readonly AtcChainId[];
  liveProtocolTransport: boolean;
  configurableFeeSplit: true;
  officialSplitPublished: false;
};

export const ATC_DEMO_SPLIT_DISCLAIMER =
  "Operator, burn, and treasury basis points are ProofLoan demo configuration, not official Attestcoin protocol tokenomics.";

export const atcEnvironmentSchema = z.enum(atcEnvironments);
export const atcActionKindSchema = z.enum(atcActionKinds);
export const atcPrioritySchema = z.enum(atcPriorities);
export const atcChainInputSchema = z.string().trim().min(3).max(64);
export const atcSenderSchema = z.string().trim().min(4).max(128);
export const atcIdempotencyKeySchema = z.string().trim().min(16).max(128);
export const atcPayloadSchema = z.record(z.string(), z.unknown());

export const atcFreeReadQuoteInputSchema = z.object({
  environment: atcEnvironmentSchema,
  actionKind: atcActionKindSchema.default("cross-chain-message"),
  sourceChain: atcChainInputSchema.optional(),
  destinationChain: atcChainInputSchema.optional(),
});

export const atcQuoteActionFeeInputSchema = z.object({
  environment: atcEnvironmentSchema,
  sender: atcSenderSchema,
  sourceChain: atcChainInputSchema,
  destinationChain: atcChainInputSchema,
  actionKind: atcActionKindSchema,
  payload: atcPayloadSchema,
  proofCount: z.number().int().min(0).max(64).default(0),
  priority: atcPrioritySchema.default("standard"),
});

export const atcPrepareActionInputSchema = atcQuoteActionFeeInputSchema.extend({
  idempotencyKey: atcIdempotencyKeySchema,
});

export const atcFeeSplitSchema = z.object({
  totalAtomic: z.string().regex(/^\d+$/),
  operatorRewardAtomic: z.string().regex(/^\d+$/),
  burnAtomic: z.string().regex(/^\d+$/),
  treasuryAtomic: z.string().regex(/^\d+$/),
});

export const atcQuoteSchema = z.object({
  quoteId: z.string().min(8).max(80),
  kind: z.enum(atcQuoteKinds),
  environment: atcEnvironmentSchema,
  sender: z.string().min(4).max(128).optional(),
  sourceChain: z.enum(atcChainIds),
  destinationChain: z.enum(atcChainIds),
  actionKind: atcActionKindSchema,
  payloadHash: z.string().regex(/^0x[0-9a-f]{64}$/),
  proofCount: z.number().int().min(0).max(64),
  priority: atcPrioritySchema,
  pricingVersion: z.string().min(3).max(64),
  fee: atcFeeSplitSchema,
  totalAtomic: z.string().regex(/^\d+$/),
  operatorRewardAtomic: z.string().regex(/^\d+$/),
  burnAtomic: z.string().regex(/^\d+$/),
  treasuryAtomic: z.string().regex(/^\d+$/),
  integrityHash: z.string().regex(/^0x[0-9a-f]{64}$/),
  expiresAt: z.string().min(20).max(40),
  createdAt: z.string().min(20).max(40),
});

export const atcActionEnvelopeSchema = z.object({
  actionId: z.string().min(8).max(80),
  nonce: z.string().regex(/^\d+$/),
  environment: atcEnvironmentSchema,
  sender: atcSenderSchema,
  sourceChain: z.enum(atcChainIds),
  destinationChain: z.enum(atcChainIds),
  actionKind: atcActionKindSchema,
  payload: atcPayloadSchema,
  payloadHash: z.string().regex(/^0x[0-9a-f]{64}$/),
  proofCount: z.number().int().min(0).max(64),
  priority: atcPrioritySchema,
  idempotencyKey: atcIdempotencyKeySchema,
  quoteId: z.string().min(8).max(80),
  createdAt: z.string().min(20).max(40),
});

export const atcSettleActionInputSchema = z.object({
  environment: atcEnvironmentSchema,
  action: atcActionEnvelopeSchema,
  quote: atcQuoteSchema,
  paymentReference: z.string().trim().min(8).max(256),
});

export type AtcFreeReadQuoteInput = z.infer<typeof atcFreeReadQuoteInputSchema>;
export type AtcQuoteActionFeeInput = z.infer<typeof atcQuoteActionFeeInputSchema>;
export type AtcPrepareActionInput = z.infer<typeof atcPrepareActionInputSchema>;
export type AtcSettleActionInput = z.infer<typeof atcSettleActionInputSchema>;

export function parseAtomic(value: string, label = "atomic amount"): bigint {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
  return BigInt(value);
}

export function formatAtomic(value: bigint): string {
  if (value < 0n) throw new Error("ATC amounts cannot be negative.");
  return value.toString(10);
}

export function addAtomic(left: string, right: string): string {
  return formatAtomic(parseAtomic(left) + parseAtomic(right));
}

export function splitAtcFee(
  totalAtomic: string,
  operatorRewardBps: number,
  burnBps: number,
  treasuryBps: number,
): AtcFeeSplit {
  const total = parseAtomic(totalAtomic, "fee total");
  const operator = (total * BigInt(operatorRewardBps)) / BigInt(ATC_BPS_DENOMINATOR);
  const burn = (total * BigInt(burnBps)) / BigInt(ATC_BPS_DENOMINATOR);
  const treasury = (total * BigInt(treasuryBps)) / BigInt(ATC_BPS_DENOMINATOR);
  let remainder = total - operator - burn - treasury;
  let operatorFinal = operator;
  let burnFinal = burn;
  let treasuryFinal = treasury;
  if (remainder !== 0n) {
    if (operatorRewardBps >= burnBps && operatorRewardBps >= treasuryBps) {
      operatorFinal += remainder;
    } else if (burnBps >= treasuryBps) {
      burnFinal += remainder;
    } else {
      treasuryFinal += remainder;
    }
    remainder = total - operatorFinal - burnFinal - treasuryFinal;
  }
  if (remainder !== 0n || operatorFinal + burnFinal + treasuryFinal !== total) {
    throw new Error("ATC fee split does not reconcile to the quoted total.");
  }
  return {
    totalAtomic: formatAtomic(total),
    operatorRewardAtomic: formatAtomic(operatorFinal),
    burnAtomic: formatAtomic(burnFinal),
    treasuryAtomic: formatAtomic(treasuryFinal),
  };
}

export function feeSplitReconciles(split: AtcFeeSplit): boolean {
  try {
    return (
      parseAtomic(split.operatorRewardAtomic) +
        parseAtomic(split.burnAtomic) +
        parseAtomic(split.treasuryAtomic) ===
      parseAtomic(split.totalAtomic)
    );
  } catch {
    return false;
  }
}

export function canonicalizeAtcValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalizeAtcValue);
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map(key => [key, canonicalizeAtcValue((value as Record<string, unknown>)[key])]),
  );
}

export function canonicalAtcJson(value: unknown): string {
  return JSON.stringify(canonicalizeAtcValue(value));
}

export function formatAtcAmount(atomic: string, decimals = 18): string {
  const value = parseAtomic(atomic);
  if (decimals < 0 || decimals > 36) throw new Error("Invalid ATC decimals.");
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction.length > 0 ? `${whole}.${fraction}` : `${whole}`;
}
