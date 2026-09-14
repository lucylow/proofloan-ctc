import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { normalizeAiError, trpcCodeForAiError } from "./errors";
import { aiUnderwritingService } from "./service";
import { aiBlockchainRouter } from "./blockchainRouter";

function mapAiError(error: unknown): never {
  if (error instanceof TRPCError) throw error;
  const normalized = normalizeAiError(error);
  throw new TRPCError({
    code: trpcCodeForAiError(normalized),
    message: `[${PROOFLOAN_ERROR_CODES.AI}] ${normalized.message}`,
  });
}

export const aiRouter = router({
  blockchain: aiBlockchainRouter,
  profile: publicProcedure.query(() => {
    try {
      return aiUnderwritingService.getProfile();
    } catch (error) {
      return mapAiError(error);
    }
  }),
  health: publicProcedure.query(() => {
    try {
      return { status: aiUnderwritingService.getProfile().status, cacheSize: aiUnderwritingService.cache.size(), auditEvents: aiUnderwritingService.audit.size() };
    } catch (error) {
      return mapAiError(error);
    }
  }),
  diagnostics: adminProcedure.query(() => {
    try {
      return { profile: aiUnderwritingService.getProfile(), cacheSize: aiUnderwritingService.cache.size(), auditEvents: aiUnderwritingService.audit.size() };
    } catch (error) {
      return mapAiError(error);
    }
  }),
  audit: adminProcedure.input(z.object({ requestId: z.string().trim().min(4).max(128).optional() })).query(({ input }) => {
    try {
      return aiUnderwritingService.audit.list(input.requestId);
    } catch (error) {
      return mapAiError(error);
    }
  }),
  setStatus: adminProcedure.input(z.object({ status: z.enum(["available", "degraded", "disabled"]) })).mutation(({ input }) => {
    try {
      aiUnderwritingService.setStatus(input.status);
      return aiUnderwritingService.getProfile();
    } catch (error) {
      return mapAiError(error);
    }
  }),
});
