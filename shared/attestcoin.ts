import { z } from "zod";
import { ATTESTCOIN_SOURCE_CHAIN_NAMES } from "./multichain";
import type { AttestorServiceSnapshot } from "./attestors";

export const attestcoinSourceChains = ATTESTCOIN_SOURCE_CHAIN_NAMES;

export type AttestcoinSourceChain = (typeof attestcoinSourceChains)[number];

export const attestcoinModeSchema = z.enum(["live", "preview", "cached"]);
export type AttestcoinMode = z.infer<typeof attestcoinModeSchema>;

export const attestcoinStageSchema = z.enum([
  "input-validated",
  "source-rpc",
  "attestation-wait",
  "proof-build",
  "proof-verify",
  "decode",
  "facts",
  "complete",
  "degraded",
]);
export type AttestcoinStage = z.infer<typeof attestcoinStageSchema>;

export const attestcoinEventTypeSchema = z.enum([
  "REPAYMENT",
  "COLLATERAL_DEPOSIT",
  "LATE_PAYMENT",
]);
export type AttestcoinEventType = z.infer<typeof attestcoinEventTypeSchema>;

export const attestcoinFreshnessSchema = z.enum(["Fresh", "Aging", "Stale"]);
export type AttestcoinFreshness = z.infer<typeof attestcoinFreshnessSchema>;

export const SUCCESS_RECEIPT_STATUS = 1;
export const SUCCESS_RECEIPT_HEX = "0x1" as const;
export const FAILED_RECEIPT_HEX = "0x0" as const;

export type AttestcoinReceiptStatusHex =
  | typeof SUCCESS_RECEIPT_HEX
  | typeof FAILED_RECEIPT_HEX;

export const attestcoinVerificationStatusSchema = z.enum([
  "verified",
  "failed",
  "stale",
  "preview",
]);
export type AttestcoinVerificationStatus = z.infer<
  typeof attestcoinVerificationStatusSchema
>;

export type AttestcoinFact = {
  id: string;
  applicationId?: string;
  chain: AttestcoinSourceChain;
  sourceBlock: number;
  txHash: string;
  txIndex?: number;
  eventType: AttestcoinEventType;
  amount: string;
  asset: string;
  verificationBlock: number;
  verifiedAt: string;
  observedAt: string;
  freshness: AttestcoinFreshness;
  proofRoot: string;
  proofHash?: string;
  verifier: string;
  sourceVerified: boolean;
  decoderVersion?: string;
  chainKey?: number | null;
  merkleProofHash?: string;
  continuityProofHash?: string;
  verificationStatus?: AttestcoinVerificationStatus;
  receiptStatus?: AttestcoinReceiptStatusHex;
  environment?: string;
  confirmations?: number;
  requestHash?: string;
};

export type AttestcoinProofReceipt = {
  requestId: string;
  requestHash?: string;
  mode: AttestcoinMode;
  stage: AttestcoinStage;
  chainKey: number;
  sourceChain: AttestcoinSourceChain;
  sourceBlock: number;
  verificationBlock: number;
  txHash: string;
  txIndex?: number;
  proofRoot: string;
  verified: boolean;
  verificationStatus?: AttestcoinVerificationStatus;
  receiptStatus?: AttestcoinReceiptStatusHex;
  merkleProofPresent?: boolean;
  continuityProofPresent?: boolean;
  freshness?: AttestcoinFreshness;
  confirmations?: number;
  confirmationDepth?: number;
  environment?: string;
  deadlineAt?: string;
  blockProver?: string;
  latencyMs: number;
  cached: boolean;
  retries: number;
  warnings: string[];
};

export type CanonicalAttestcoinProofRecord = {
  requestId: string;
  requestHash: string;
  environment: string;
  chainKey: number;
  sourceChain: AttestcoinSourceChain;
  sourceBlock: number;
  txHash: string;
  txIndex: number;
  merkleProof: unknown;
  continuityProof: unknown;
  merkleProofHash: string;
  continuityProofHash: string;
  verificationStatus: Extract<AttestcoinVerificationStatus, "verified">;
  freshness: AttestcoinFreshness;
  proofRoot: string;
  receiptStatus: typeof SUCCESS_RECEIPT_HEX;
  verificationBlock: number;
  confirmations: number;
  confirmationDepth: number;
  blockProver: string;
  decoderContract: string;
  deadlineAt: string;
  generatedAt: string;
  verifiedAt: string;
  txBytes: string;
};

export type AttestcoinProofBundle = {
  receipt: AttestcoinProofReceipt;
  facts: AttestcoinFact[];
  rawProof?: {
    chainKey: number;
    headerNumber: number;
    txIndex?: number;
    txBytes: string;
    merkleProof: unknown;
    continuityProof: unknown;
  };
  canonicalProof?: CanonicalAttestcoinProofRecord;
  attestorNetwork?: AttestorServiceSnapshot;
};

export type AttestcoinHealth = {
  creditcoinRpc: "healthy" | "degraded" | "offline";
  proofBuilder: "healthy" | "degraded" | "offline";
  sourceRpc: "healthy" | "degraded" | "offline";
  lastCheckedAt: string;
  latencyMs: number;
  message?: string;
};

export type AttestcoinMetrics = {
  requests: number;
  successes: number;
  failures: number;
  cacheHits: number;
  previewFallbacks: number;
  retries: number;
  averageLatencyMs: number;
};

export const attestcoinProofRequestSchema = z.object({
  txHash: z.string().trim().regex(/^0x[0-9a-fA-F]{64}$/),
  sourceChain: z.enum(attestcoinSourceChains),
  requestId: z.string().trim().min(8).max(128).optional(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
  deadlineMs: z.number().int().min(1_000).max(120_000).optional(),
  allowPreviewFallback: z.boolean().default(false),
  forceRefresh: z.boolean().default(false),
});

export type AttestcoinProofRequest = z.infer<typeof attestcoinProofRequestSchema>;
