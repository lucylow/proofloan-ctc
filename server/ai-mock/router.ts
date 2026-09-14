import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { AI_MOCK_SCENARIO_IDS } from "@shared/aiMockTypes";
import { getAiMockScenario, listAiMockScenarios } from "./index";
import { getAiMockDashboard, getAiMockDataset, simulateAiFailure } from "./service";
import { summarizeAllAiScenarios } from "./metrics";

const scenarioIdSchema = z.enum(AI_MOCK_SCENARIO_IDS);

function withAiMockQuery<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message = error instanceof Error ? error.message : "AI mock dataset failed.";
    throw new TRPCError({
      code: message.toLowerCase().includes("unknown") ? "NOT_FOUND" : "BAD_REQUEST",
      message: `[${PROOFLOAN_ERROR_CODES.AI_MOCK}] ${message}`,
    });
  }
}

export const aiMockRouter = router({
  list: publicProcedure.query(() => withAiMockQuery(() => getAiMockDataset())),
  scenarios: publicProcedure.query(() =>
    withAiMockQuery(() =>
      listAiMockScenarios().map(scenario => ({
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        recommendation: scenario.recommendation,
        confidenceBand: scenario.confidenceBand,
        failureMode: scenario.failureMode,
        tags: scenario.tags,
        sourceChains: scenario.sourceChains,
      })),
    ),
  ),
  metrics: publicProcedure.query(() =>
    withAiMockQuery(() => summarizeAllAiScenarios(listAiMockScenarios())),
  ),
  dashboard: publicProcedure
    .input(z.object({ scenarioId: scenarioIdSchema }))
    .query(({ input }) => withAiMockQuery(() => getAiMockDashboard(input.scenarioId))),
  scenario: publicProcedure
    .input(z.object({ scenarioId: scenarioIdSchema }))
    .query(({ input }) => withAiMockQuery(() => getAiMockScenario(input.scenarioId))),
  simulateFailure: publicProcedure
    .input(z.object({ scenarioId: scenarioIdSchema }))
    .query(({ input }) => withAiMockQuery(() => simulateAiFailure(input.scenarioId))),
});
