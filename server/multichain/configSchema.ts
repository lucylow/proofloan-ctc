import { z } from "zod";
import {
  ATTESTCOIN_ENVIRONMENT_IDS,
  ATTESTCOIN_SOURCE_CHAIN_NAMES,
  BLOCK_PROVER_PRECOMPILE,
  CHAININFO_PRECOMPILE,
  SOURCE_CHAIN_SUPPORT,
} from "@shared/multichain";

export const attestcoinEnvironmentConfigSchema = z.object({
  id: z.enum(ATTESTCOIN_ENVIRONMENT_IDS),
  label: z.string().min(3),
  networkKind: z.enum(["testnet", "mainnet"]),
  evmChainId: z.number().int().positive(),
  creditcoinRpcUrl: z.string().url(),
  creditcoinRpcUrls: z.array(z.string().url()).min(1),
  proofBuilderUrl: z.string().url(),
  decoderContract: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  chainInfoPrecompile: z.literal(CHAININFO_PRECOMPILE),
  blockProverPrecompile: z.literal(BLOCK_PROVER_PRECOMPILE),
  timeoutMs: z.number().int().min(1_000).max(120_000),
  retryCount: z.number().int().min(0).max(8),
  cacheTtlMs: z.number().int().min(1_000),
  maxConcurrentProofs: z.number().int().min(1).max(16),
  staleProofMaxAgeMs: z.number().int().min(1_000),
  rejectStaleLiveProofs: z.boolean(),
});

export const sourceChainConfigSchema = z.object({
  name: z.enum(ATTESTCOIN_SOURCE_CHAIN_NAMES),
  evmChainId: z.number().int().positive(),
  rpcUrl: z.string().url(),
  rpcUrls: z.array(z.string().url()).min(1),
  support: z.enum(SOURCE_CHAIN_SUPPORT),
  chainKey: z.number().int().positive().nullable(),
  liveProofEnabled: z.boolean(),
  experimental: z.boolean(),
  confirmationDepth: z.number().int().min(1),
  staleAfterBlocks: z.number().int().min(2),
  previewEnabled: z.boolean(),
});

export const productionCostModelSchema = z.object({
  crossChainReads: z.literal("free"),
  crossChainActions: z.literal("atc-paid"),
  minting: z.literal(false),
});

export const productionAscModelSchema = z.object({
  blockProverPrecompile: z.literal(BLOCK_PROVER_PRECOMPILE),
  verify: z.tuple([z.literal("merkle"), z.literal("continuity")]),
  requireReceiptStatus: z.literal("0x1"),
});

export type AttestcoinEnvironmentConfig = z.infer<typeof attestcoinEnvironmentConfigSchema>;
export type SourceChainConfig = z.infer<typeof sourceChainConfigSchema>;

export function parseEnvironmentConfig(value: unknown): AttestcoinEnvironmentConfig {
  return attestcoinEnvironmentConfigSchema.parse(value);
}

export function parseSourceChainConfig(value: unknown): SourceChainConfig {
  return sourceChainConfigSchema.parse(value);
}
