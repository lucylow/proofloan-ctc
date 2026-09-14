import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { demoHealth } from "./health";
import { demoService } from "./service";
import { loadDemoConfig } from "./config";
import { getDemoProfile } from "./profiles";
import { DEMO_PROFILE_IDS } from "./types";
import { normalizeDemoError, trpcCodeForDemoError } from "./errors";
import {
  buildBatch,
  evaluateExtendedCase,
  getExtendedCase,
  listExtendedCases,
  searchExtendedCases,
} from "./extended";

const demoProfileIdSchema = z.enum(DEMO_PROFILE_IDS);
const extendedCaseIdSchema = z.string().trim().min(1).max(128);
const searchQuerySchema = z.string().max(200).default("");

function withDemoQuery<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeDemoError(error);
    throw new TRPCError({
      code: trpcCodeForDemoError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.DEMO}] ${normalized.message}`,
    });
  }
}

async function withDemoMutation<T>(work: () => Promise<T> | T): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeDemoError(error);
    throw new TRPCError({
      code: trpcCodeForDemoError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.DEMO}] ${normalized.message}`,
    });
  }
}

export const demoRouter = router({
  health: publicProcedure.query(() => withDemoQuery(() => demoHealth())),
  config: publicProcedure.query(() =>
    withDemoQuery(() => {
      const config = loadDemoConfig();
      return { ...config, warning: "Demo data is synthetic and never proves a live cross-chain fact." };
    }),
  ),
  profiles: publicProcedure.query(() => withDemoQuery(() => demoService.listProfiles())),
  profile: publicProcedure.input(z.object({ profileId: demoProfileIdSchema })).query(({ input }) =>
    withDemoQuery(() => getDemoProfile(input.profileId)),
  ),
  scenario: publicProcedure.input(z.object({ profileId: demoProfileIdSchema })).query(({ input }) =>
    withDemoQuery(() => demoService.scenario(input.profileId)),
  ),
  createApplication: publicProcedure.input(z.object({ profileId: demoProfileIdSchema })).mutation(({ input }) =>
    withDemoMutation(() => demoService.create(input.profileId)),
  ),
  getApplication: publicProcedure.input(z.object({ applicationId: z.string().trim().min(4).max(128) })).query(({ input }) =>
    withDemoQuery(() => demoService.get(input.applicationId)),
  ),
  reset: publicProcedure.mutation(() =>
    withDemoMutation(() => {
      demoService.reset();
      return { success: true as const };
    }),
  ),
  extendedCases: publicProcedure.query(() => withDemoQuery(() => listExtendedCases())),
  extendedCase: publicProcedure.input(z.object({ id: extendedCaseIdSchema })).query(({ input }) =>
    withDemoQuery(() => getExtendedCase(input.id)),
  ),
  searchExtendedCases: publicProcedure.input(z.object({ query: searchQuerySchema })).query(({ input }) =>
    withDemoQuery(() => searchExtendedCases(input.query)),
  ),
  extendedBatch: publicProcedure.query(() => withDemoQuery(() => buildBatch(listExtendedCases()))),
  evaluateExtendedCase: publicProcedure.input(z.object({ id: extendedCaseIdSchema })).query(({ input }) =>
    withDemoQuery(() => evaluateExtendedCase(input.id)),
  ),
});
