import { TRPCError } from "@trpc/server";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { publicProcedure, router } from "../_core/trpc";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import {
  TRANSACTION_PROVING_FLOW,
  TRANSACTION_PROVING_PIPELINE,
  continuityCostInputSchema,
  transactionTargetInputSchema,
} from "@shared/transactionProving";
import { estimateContinuityCost } from "./cost";
import { chooseCheckpoint } from "./planner";
import { normalizeTransactionProvingError, trpcCodeForTransactionProvingError } from "./errors";
import { transactionProvingService } from "./instance";
import { PRODUCTION_TRANSACTION_PROVING_BOUNDARIES } from "./adapters";

function runProving<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeTransactionProvingError(error);
    throw new TRPCError({
      code: trpcCodeForTransactionProvingError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.PROVING}] ${normalized.message}`,
    });
  }
}

async function runProvingAsync<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeTransactionProvingError(error);
    throw new TRPCError({
      code: trpcCodeForTransactionProvingError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.PROVING}] ${normalized.message}`,
    });
  }
}

export const transactionProvingRouter = router({
  health: publicProcedure.query(() => runProving(() => transactionProvingService.health())),

  pipeline: publicProcedure.query(() =>
    runProving(() => ({
      phases: [...TRANSACTION_PROVING_PIPELINE],
      flow: [...TRANSACTION_PROVING_FLOW],
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
    })),
  ),

  boundaries: publicProcedure.query(() => runProving(() => PRODUCTION_TRANSACTION_PROVING_BOUNDARIES)),

  metrics: publicProcedure.query(() => runProving(() => transactionProvingService.metrics.snapshot())),

  storeStats: publicProcedure.query(() => runProving(() => transactionProvingService.store.snapshot())),

  estimateCost: publicProcedure.input(continuityCostInputSchema).query(({ input }) =>
    runProving(() => {
      const estimatedCtc = estimateContinuityCost(input.hashCount);
      return {
        hashCount: input.hashCount,
        estimatedCtc,
        decision: input.budgetCtc == null ? "submit" : chooseCheckpoint(input.hashCount, input.budgetCtc),
        formula: "2.3e-5 + 2.9e-7 × continuity hash count",
      };
    }),
  ),

  provePreview: publicProcedure.input(transactionTargetInputSchema).mutation(({ input }) =>
    runProvingAsync(() =>
      transactionProvingService.provePreview({
        chainKey: input.chainKey,
        txHash: input.txHash,
        sourceAddress: input.sourceAddress,
        contractAddress: input.contractAddress,
        eventSignature: input.eventSignature,
      }),
    ),
  ),
});
