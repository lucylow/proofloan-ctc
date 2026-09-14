import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { normalizeAiError, trpcCodeForAiError } from "./errors";
import { aiBlockchainRoute } from "./blockchain/router";
import { buildBlockchainFeatures } from "./blockchain/featureBuilder";
import { scoreVerifiedBehavior } from "./blockchain/proofAwareScoring";
import { blockchainFeatureFingerprint } from "./blockchain/featureFingerprint";
import { walletRisk } from "./blockchain/walletRisk";
import { buildBlockchainPromptContext } from "./blockchain/blockchainPromptContext";
import { parseBlockchainFeatureInput } from "./blockchain/coerceFeatures";
import type { AIBlockchainFeatures } from "./blockchain/featureTypes";
import { enforceEvidenceMode } from "./blockchain/liveVsMockGuard";

function mapAiError(error: unknown): never {
  if (error instanceof TRPCError) throw error;
  const normalized = normalizeAiError(error);
  throw new TRPCError({
    code: trpcCodeForAiError(normalized),
    message: `[${PROOFLOAN_ERROR_CODES.AI}] ${normalized.message}`,
  });
}

const observation = z.object({
  chainId: z.string().min(1),
  blockNumber: z.number().int().nonnegative(),
  txHash: z.string().min(3),
  direction: z.enum(["in", "out", "self"]),
  asset: z.string().min(1),
  amount: z.string().min(1),
  timestampMs: z.number().finite(),
  verified: z.boolean(),
  address: z.string().min(3),
});

const event = z.object({
  chainId: z.string().min(1),
  blockNumber: z.number().int().nonnegative(),
  blockHash: z.string().min(3),
  txHash: z.string().min(3),
  txIndex: z.number().int().nonnegative(),
  address: z.string().min(3),
  topic0: z.string().min(1),
  data: z.string(),
  timestampMs: z.number().finite(),
  verified: z.boolean(),
  evidenceId: z.string().min(1),
});

const blockchainFeatureInput = z.object({
  walletAgeDays: z.number().finite(),
  transactionCount30d: z.number().finite(),
  transactionCount180d: z.number().finite(),
  activeDays30d: z.number().finite(),
  uniqueContracts30d: z.number().finite(),
  uniqueChains180d: z.number().finite(),
  inboundVolume30d: z.number().finite(),
  outboundVolume30d: z.number().finite(),
  netFlow30d: z.number().finite(),
  counterpartyDiversity: z.number().finite(),
  repaymentSignal: z.number().finite(),
  volatilitySignal: z.number().finite(),
  liquiditySignal: z.number().finite(),
  gasDisciplineSignal: z.number().finite(),
  proofCoverage: z.number().finite(),
  freshnessScore: z.number().finite(),
  crossChainConsistency: z.number().finite(),
  anomalyScore: z.number().finite(),
  evidenceDensity: z.number().finite(),
});

function parsedFeatures(features: AIBlockchainFeatures): AIBlockchainFeatures {
  return parseBlockchainFeatureInput(features);
}

export const aiBlockchainRouter = router({
  features: publicProcedure
    .input(z.object({
      nowMs: z.number().finite().optional(),
      observations: z.array(observation).default([]),
      events: z.array(event).default([]),
      evidenceMode: z.enum(["verified", "mock"]).default("verified"),
      allowMock: z.boolean().optional(),
    }))
    .query(({ input }) => {
      try {
        enforceEvidenceMode(input.evidenceMode, Boolean(input.allowMock));
        return buildBlockchainFeatures({
          nowMs: input.nowMs ?? Date.now(),
          observations: input.observations,
          events: input.events,
        });
      } catch (error) {
        return mapAiError(error);
      }
    }),
  score: publicProcedure.input(z.object({ features: blockchainFeatureInput })).query(({ input }) => {
    try {
      return scoreVerifiedBehavior(parsedFeatures(input.features));
    } catch (error) {
      return mapAiError(error);
    }
  }),
  fingerprint: publicProcedure.input(z.object({ features: blockchainFeatureInput })).query(({ input }) => {
    try {
      return blockchainFeatureFingerprint(parsedFeatures(input.features));
    } catch (error) {
      return mapAiError(error);
    }
  }),
  route: publicProcedure.input(z.object({ features: blockchainFeatureInput })).query(({ input }) => {
    try {
      return aiBlockchainRoute(parsedFeatures(input.features));
    } catch (error) {
      return mapAiError(error);
    }
  }),
  walletRisk: publicProcedure.input(z.object({ features: blockchainFeatureInput })).query(({ input }) => {
    try {
      return walletRisk(parsedFeatures(input.features));
    } catch (error) {
      return mapAiError(error);
    }
  }),
  promptContext: publicProcedure.input(z.object({ features: blockchainFeatureInput })).query(({ input }) => {
    try {
      return buildBlockchainPromptContext(parsedFeatures(input.features));
    } catch (error) {
      return mapAiError(error);
    }
  }),
});
