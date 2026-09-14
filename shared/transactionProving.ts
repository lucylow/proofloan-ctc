import { z } from "zod";
import { ATTESTCOIN_SOURCE_CHAIN_NAMES } from "./multichain";

export const TRANSACTION_PROVING_PIPELINE = [
  "query",
  "proof-generation",
  "verification",
  "data-extraction",
] as const;
export type TransactionProvingPhase = (typeof TRANSACTION_PROVING_PIPELINE)[number];

export const TRANSACTION_PROVING_FLOW = [
  "target-transaction",
  "query-phase",
  "proof-builder",
  "merkle-proof",
  "continuity-proof",
  "proof-envelope",
  "creditcoin-asc",
  "block-prover-precompile",
  "cryptographic-verification",
  "transaction-data-extraction",
  "proofloan-business-logic",
] as const;
export type TransactionProvingFlowStep = (typeof TRANSACTION_PROVING_FLOW)[number];

export const hex32Schema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "txHash must be a 32-byte 0x-prefixed hex value");

export const transactionTargetInputSchema = z.object({
  chainKey: z.number().int().nonnegative(),
  txHash: hex32Schema,
  sourceAddress: z.string().min(8).optional(),
  contractAddress: z.string().min(8).optional(),
  eventSignature: z.string().min(1).optional(),
  sourceChain: z.enum(ATTESTCOIN_SOURCE_CHAIN_NAMES).optional(),
});
export type TransactionTargetInput = z.infer<typeof transactionTargetInputSchema>;

export const continuityCostInputSchema = z.object({
  hashCount: z.number().int().nonnegative(),
  budgetCtc: z.number().positive().optional(),
});
export type ContinuityCostInput = z.infer<typeof continuityCostInputSchema>;
