import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import { attestcoinOrchestrator } from "./attestcoin/orchestrator";
import { checkAttestcoinHealth } from "./attestcoin/health";
import { buildPreviewBundle } from "./attestcoin/preview";
import { normalizeAttestcoinError } from "./attestcoin/errors";
import { attestcoinProofRequestSchema, attestcoinSourceChains } from "@shared/attestcoin";
import {
  atcFreeReadQuoteInputSchema,
  atcPrepareActionInputSchema,
  atcQuoteActionFeeInputSchema,
  atcSettleActionInputSchema,
} from "@shared/atc";
import { getPublicEnvironmentSnapshot } from "./multichain/environment";
import { buildFeatureMatrix } from "./multichain/featureMatrix";
import { getPublicChainCatalog } from "./multichain/catalog";
import { PRODUCTION_ADAPTER_BOUNDARIES } from "./multichain/adapters";
import { creditcoinExecutionAdapter } from "./multichain/execution";
import { atcService, normalizeAtcError, trpcCodeForAtcError } from "./atc";

function atcProcedureError(error: unknown): never {
  const normalized = normalizeAtcError(error);
  throw new TRPCError({
    code: trpcCodeForAtcError(normalized),
    message: normalized.message,
  });
}

function withAtcQuery<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    atcProcedureError(error);
  }
}

export const attestcoinRouter = router({
  environment: publicProcedure.query(() => getPublicEnvironmentSnapshot()),

  catalog: publicProcedure.query(() => getPublicChainCatalog()),

  operatorDiagnostics: publicProcedure.query(() => ({
    ...attestcoinOrchestrator.diagnostics(),
    catalog: getPublicChainCatalog(),
    atc: atcService.health(),
    adapters: PRODUCTION_ADAPTER_BOUNDARIES,
  })),

  capabilities: publicProcedure.query(() => buildFeatureMatrix()),

  feePolicy: publicProcedure.query(() => withAtcQuery(() => atcService.feePolicy())),
  health: publicProcedure.query(() => withAtcQuery(() => atcService.health())),
  atcCapabilities: publicProcedure.query(() => withAtcQuery(() => atcService.capabilities())),
  summary: publicProcedure.query(() => withAtcQuery(() => atcService.summary())),
  freeReadQuote: publicProcedure.input(atcFreeReadQuoteInputSchema).query(({ input }) => {
    try {
      return creditcoinExecutionAdapter.quoteFreeRead(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  quoteActionFee: publicProcedure.input(atcQuoteActionFeeInputSchema).query(({ input }) => {
    try {
      return atcService.quoteAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  prepareAction: publicProcedure.input(atcPrepareActionInputSchema).mutation(async ({ input }) => {
    try {
      return await creditcoinExecutionAdapter.preparePaidAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  settleAction: publicProcedure.input(atcSettleActionInputSchema).mutation(async ({ input }) => {
    try {
      return await creditcoinExecutionAdapter.settlePaidAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),
  dryRunAction: publicProcedure.input(atcPrepareActionInputSchema).mutation(({ input }) => {
    try {
      return atcService.dryRunAction(input);
    } catch (error) {
      atcProcedureError(error);
    }
  }),

  status: publicProcedure
    .input(
      z.object({
        sourceChain: z.enum(attestcoinSourceChains),
      }),
    )
    .query(async ({ input }) => {
      return checkAttestcoinHealth(
        input.sourceChain,
      );
    }),

  diagnostics: publicProcedure.query(() => {
    return attestcoinOrchestrator.diagnostics();
  }),

  prove: publicProcedure
    .input(attestcoinProofRequestSchema)
    .mutation(async ({ input }) => {
      try {
        return await attestcoinOrchestrator.request(
          input,
        );
      } catch (error) {
        const normalized =
          normalizeAttestcoinError(error);

        throw new TRPCError({
          code: normalized.retriable ? "TIMEOUT" : "BAD_REQUEST",
          message: `[ATTESTCOIN:${normalized.kind}] ${normalized.message}`,
        });
      }
    }),

  preview: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().trim().min(10).max(128),
        sourceChain: z.enum(attestcoinSourceChains),
      }),
    )
    .query(({ input }) =>
      buildPreviewBundle(
        input.walletAddress,
        input.sourceChain,
      ),
    ),
});
