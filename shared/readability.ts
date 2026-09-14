import { z } from "zod";
import { ATTESTCOIN_ENVIRONMENT_IDS, ATTESTCOIN_SOURCE_CHAIN_NAMES } from "./multichain";

export const readabilityEnvironmentSchema = z.enum(ATTESTCOIN_ENVIRONMENT_IDS);
export type ReadabilityEnvironment = z.infer<typeof readabilityEnvironmentSchema>;

export const readabilityAdapterSchema = z.enum(["preview", "live"]);
export type ReadabilityAdapter = z.infer<typeof readabilityAdapterSchema>;

export const READABILITY_PIPELINE = [
  "source-event",
  "worker-scan",
  "finality",
  "attestation",
  "proof-builder",
  "merkle-continuity",
  "asc",
  "block-prover",
  "receipt-success",
  "business-logic",
] as const;
export type ReadabilityPipelineStep = (typeof READABILITY_PIPELINE)[number];

/**
 * Generic ERC-20/721/1155 names are too ambiguous for cross-chain credit
 * evidence. Attestcoin readability guidance is to emit focused application
 * events that already contain the required destination-chain data.
 */
export const GENERIC_SOURCE_EVENTS = [
  "Transfer",
  "Approval",
  "TransferSingle",
  "TransferBatch",
  "ApprovalForAll",
] as const;
export type GenericSourceEvent = (typeof GENERIC_SOURCE_EVENTS)[number];

export const FOCUSED_SOURCE_EVENTS = [
  "CreditPositionOpened",
  "RepaymentRecorded",
  "CollateralPosted",
  "CollateralReleased",
  "LoanOriginated",
  "LatePaymentRecorded",
  "CreditLimitUpdated",
] as const;
export type FocusedSourceEvent = (typeof FOCUSED_SOURCE_EVENTS)[number];

export const REQUIRED_SOURCE_EVENT_FIELDS = [
  "chainId",
  "blockNumber",
  "blockHash",
  "transactionHash",
  "transactionIndex",
  "logIndex",
  "contractAddress",
  "eventName",
] as const;

export const hexStringSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]*$/, "Value must be 0x-prefixed hex");

export const sourceEventSchema = z.object({
  chainId: z.string().min(1),
  blockNumber: z.number().int().nonnegative(),
  blockHash: hexStringSchema.min(10),
  transactionHash: hexStringSchema.min(10),
  transactionIndex: z.number().int().nonnegative(),
  logIndex: z.number().int().nonnegative(),
  contractAddress: z.string().min(8),
  eventName: z.string().min(1),
  topics: z.array(z.string()),
  data: hexStringSchema,
  confirmations: z.number().int().nonnegative(),
  observedAt: z.string().datetime(),
});
export type SourceEvent = z.infer<typeof sourceEventSchema>;

export const readabilityQuerySchema = z.object({
  environment: readabilityEnvironmentSchema,
  sourceChain: z.enum(ATTESTCOIN_SOURCE_CHAIN_NAMES),
  sourceContract: z.string().min(8),
  eventName: z.string().min(1),
  transactionHash: hexStringSchema.min(10).optional(),
  minConfirmations: z.number().int().nonnegative().default(32),
  deadline: z.string().datetime().optional(),
});
export type ReadabilityQuery = z.infer<typeof readabilityQuerySchema>;

export const merkleSiblingSchema = z.object({
  hash: hexStringSchema,
  left: z.boolean(),
});
export type MerkleSibling = z.infer<typeof merkleSiblingSchema>;

export const merkleHashingSchema = z.literal("usc-keccak-domain-separated");
export type MerkleHashing = z.infer<typeof merkleHashingSchema>;

export const merkleInclusionSchema = z.object({
  valid: z.boolean(),
  educational: z.boolean(),
  skipped: z.boolean().optional(),
  hashing: merkleHashingSchema.optional(),
  leafCount: z.number().int().positive().optional(),
  transactionIndex: z.number().int().nonnegative().optional(),
  depth: z.number().int().nonnegative().optional(),
  siblingCount: z.number().int().nonnegative().optional(),
  merkleRoot: hexStringSchema.optional(),
  computedRoot: hexStringSchema.optional(),
  reason: z.string().optional(),
});
export type MerkleInclusion = z.infer<typeof merkleInclusionSchema>;

export const proofBundleSchema = z.object({
  adapter: readabilityAdapterSchema,
  chainKey: z.number().int().nonnegative(),
  blockHeight: z.number().int().nonnegative(),
  encodedTransaction: hexStringSchema,
  merkleProofPresent: z.boolean(),
  continuityProofPresent: z.boolean(),
  merkleRoot: hexStringSchema.optional(),
  siblings: z.array(merkleSiblingSchema).optional(),
  leafCount: z.number().int().positive().optional(),
  hashing: merkleHashingSchema.optional(),
  lowerEndpointDigest: hexStringSchema.optional(),
  continuityRoots: z.array(hexStringSchema).optional(),
  liveMerkleProof: z.unknown().optional(),
  liveContinuityProof: z.unknown().optional(),
  txIndex: z.number().int().nonnegative().optional(),
  receiptStatus: z.number().int().optional(),
  proofRoot: hexStringSchema.optional(),
});
export type ProofBundle = z.infer<typeof proofBundleSchema>;

export const readabilityReceiptSchema = z.object({
  queryId: z.string().min(8),
  environment: readabilityEnvironmentSchema,
  adapter: readabilityAdapterSchema,
  transactionHash: z.string().min(8),
  verified: z.boolean(),
  receiptStatus: z.literal(1),
  deliveredAt: z.string().datetime(),
  sourceEvent: sourceEventSchema.optional(),
  chainKey: z.number().int().nonnegative().optional(),
  sourceBlock: z.number().int().nonnegative().optional(),
  proofRoot: z.string().optional(),
  blockProver: z.string().optional(),
  educational: z.boolean().optional(),
  merkleInclusion: merkleInclusionSchema.optional(),
});
export type ReadabilityReceipt = z.infer<typeof readabilityReceiptSchema>;

export const readabilityMerkleVerifyInputSchema = z.object({
  encodedTransaction: hexStringSchema,
  merkleRoot: hexStringSchema,
  siblings: z.array(merkleSiblingSchema),
  leafCount: z.number().int().positive().optional(),
  txIndex: z.number().int().nonnegative().optional(),
});
export type ReadabilityMerkleVerifyInput = z.infer<typeof readabilityMerkleVerifyInputSchema>;

export const readabilityPreviewInputSchema = z.object({
  query: readabilityQuerySchema,
  event: sourceEventSchema,
});
export type ReadabilityPreviewInput = z.infer<typeof readabilityPreviewInputSchema>;

export const readabilityLiveInputSchema = z.object({
  environment: readabilityEnvironmentSchema,
  sourceChain: z.enum(ATTESTCOIN_SOURCE_CHAIN_NAMES),
  sourceContract: z.string().min(8),
  eventName: z.string().min(1),
  transactionHash: hexStringSchema.min(10),
  minConfirmations: z.number().int().nonnegative().default(32),
  deadline: z.string().datetime().optional(),
});
export type ReadabilityLiveInput = z.infer<typeof readabilityLiveInputSchema>;

export const readabilityGasEstimateInputSchema = z.object({
  continuityHashCount: z.number().nonnegative(),
  merkleSiblingCount: z.number().nonnegative().default(1),
  encodedTransactionBytes: z.number().int().nonnegative(),
  gasPriceCtc: z.number().nonnegative().optional(),
});
export type ReadabilityGasEstimateInput = z.infer<typeof readabilityGasEstimateInputSchema>;

export const readabilityGasPlanInputSchema = readabilityGasEstimateInputSchema.extend({
  eventBlock: z.number().int().nonnegative(),
  attestedBlock: z.number().int().nonnegative(),
  deadlineMs: z.number().int().optional(),
  nowMs: z.number().int().optional(),
});
export type ReadabilityGasPlanInput = z.infer<typeof readabilityGasPlanInputSchema>;

export const readabilityGasCompareInputSchema = z.object({
  continuityNow: z.number().nonnegative(),
  continuityLater: z.number().nonnegative(),
});
export type ReadabilityGasCompareInput = z.infer<typeof readabilityGasCompareInputSchema>;
