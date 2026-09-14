import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  readabilityEnvironmentSchema,
  readabilityGasCompareInputSchema,
  readabilityGasEstimateInputSchema,
  readabilityGasPlanInputSchema,
  readabilityLiveInputSchema,
  readabilityMerkleVerifyInputSchema,
  readabilityPreviewInputSchema,
} from "@shared/readability";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { normalizeReadabilityError, trpcCodeForReadabilityError } from "./errors";
import { readabilityService } from "./runtime";
import { readabilityOffchainRuntime } from "./offchain-runtime";
import { eventPolicySnapshot } from "./event-policy";
import { allowedTransitions } from "./status-machine";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { compareTiming } from "./gas/compare";
import { GAS_POLICY_VERSION, OFFICIAL_CTC_FORMULA, READABILITY_GAS_POLICY } from "./gas/constants";
import { assessMerkleProof } from "./merkle/verify";

function readabilityProcedureError(error: unknown): never {
  const normalized = normalizeReadabilityError(error);
  throw new TRPCError({
    code: trpcCodeForReadabilityError(normalized),
    message: `[${PROOFLOAN_ERROR_CODES.READABILITY}] ${normalized.message}`,
  });
}

export const readabilityRouter = router({
  health: publicProcedure.query(() => ({
    ...readabilityService.health(),
    offchainWorker: readabilityOffchainRuntime.health(),
  })),

  policy: publicProcedure.query(() => eventPolicySnapshot()),

  pipeline: publicProcedure.query(() => readabilityService.health().pipeline),

  environment: publicProcedure
    .input(z.object({ environment: readabilityEnvironmentSchema }))
    .query(({ input }) => ({
      environment: input.environment,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      synchronousVerification: true,
      liveProofsUseUscSdk: true,
      previewProofsAreEducational: true,
    })),

  storeStats: publicProcedure.query(() => readabilityService.store.snapshot()),

  transitions: publicProcedure.query(() => allowedTransitions()),

  submitPreview: publicProcedure.input(readabilityPreviewInputSchema).mutation(async ({ input }) => {
    try {
      return await readabilityService.deliverPreview(input.query, input.event);
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  deliverLive: publicProcedure.input(readabilityLiveInputSchema).mutation(async ({ input }) => {
    try {
      return await readabilityService.deliverLive(input);
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  verifyMerkle: publicProcedure.input(readabilityMerkleVerifyInputSchema).query(({ input }) => {
    try {
      return assessMerkleProof({
        encodedTransaction: input.encodedTransaction,
        merkleRoot: input.merkleRoot,
        siblings: input.siblings,
        leafCount: input.leafCount,
        txIndex: input.txIndex,
        educational: true,
      });
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  workerHealth: publicProcedure.query(() => readabilityOffchainRuntime.health()),

  workerJobs: publicProcedure.query(async () => ({ items: await readabilityOffchainRuntime.jobs() })),

  workerDeadLetters: publicProcedure.query(async () => ({ items: await readabilityOffchainRuntime.deadLetters() })),

  ingestDurablePreview: publicProcedure.input(readabilityPreviewInputSchema).mutation(async ({ input }) => {
    try {
      return await readabilityOffchainRuntime.ingestPreview(input.query, input.event);
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  discover: publicProcedure
    .input(
      z.object({
        address: z.string().trim().min(8).max(128),
        eventName: z.string().trim().min(1).max(128),
        chainId: z.string().trim().min(2).max(64).optional(),
        queryId: z.string().trim().min(4).max(128).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await readabilityOffchainRuntime.discover(input);
      } catch (error) {
        readabilityProcedureError(error);
      }
    }),

  tick: publicProcedure.mutation(async () => {
    try {
      return await readabilityOffchainRuntime.tick();
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  estimateGas: publicProcedure.input(readabilityGasEstimateInputSchema).query(({ input }) => {
    try {
      const estimate = readabilityService.gas.estimate(input);
      return {
        ...estimate,
        officialModel: OFFICIAL_CTC_FORMULA,
      };
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  optimizeGas: publicProcedure.input(readabilityGasPlanInputSchema).query(({ input }) => {
    try {
      const decision = readabilityService.gas.optimize(input);
      const scheduled = readabilityService.gas.schedule(input, decision);
      return {
        ...decision,
        lane: scheduled.lane,
        runAfter: scheduled.runAfter,
        officialModel: OFFICIAL_CTC_FORMULA,
      };
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  compareGas: publicProcedure.input(readabilityGasCompareInputSchema).query(({ input }) => {
    try {
      return {
        ...compareTiming(input.continuityNow, input.continuityLater),
        officialModel: OFFICIAL_CTC_FORMULA,
      };
    } catch (error) {
      readabilityProcedureError(error);
    }
  }),

  gasPolicy: publicProcedure.query(() => ({
    modelVersion: GAS_POLICY_VERSION,
    officialModel: OFFICIAL_CTC_FORMULA,
    workerEnforcement: readabilityService.health().gas.aware,
    ...READABILITY_GAS_POLICY,
  })),

  gasMetrics: publicProcedure.query(() => readabilityService.gas.snapshot()),
});
