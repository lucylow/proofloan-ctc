import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { attestorService } from "./attestors";
import { publicList } from "./attestors/operatorViews";
import { currentAttestorEnvironment } from "./attestors/operational";

const environmentInput = z.object({
  environment: z.enum(["cc3-testnet", "cc3-mainnet"]).default("cc3-testnet"),
});

export const attestorsRouter = router({
  summary: publicProcedure.input(environmentInput.optional()).query(({ input }) => {
    const environment = currentAttestorEnvironment(input?.environment);
    const snapshot = attestorService.snapshot(environment);
    return {
      ...snapshot,
      activities: attestorService.audit.list(25).map(event => ({
        type: event.type,
        at: event.at,
        digest: event.digest,
        metadata: event.metadata,
      })),
      metrics: attestorService.metrics.toJSON(),
    };
  }),

  health: publicProcedure.input(environmentInput.optional()).query(({ input }) => {
    const environment = currentAttestorEnvironment(input?.environment);
    return {
      snapshot: attestorService.snapshot(environment),
      operators: attestorService.health(environment),
    };
  }),

  operators: publicProcedure.input(environmentInput.optional()).query(({ input }) => {
    const environment = currentAttestorEnvironment(input?.environment);
    return { items: publicList(attestorService.registry.list(environment)) };
  }),

  certificates: publicProcedure
    .input(z.object({
      environment: z.enum(["cc3-testnet", "cc3-mainnet"]).default("cc3-testnet"),
      sourceChain: z.string().min(2).max(128).optional(),
    }).optional())
    .query(async ({ input }) => {
      return { items: await attestorService.persistence.listCertificates(input?.sourceChain) };
    }),

  faults: publicProcedure
    .input(z.object({
      operatorId: z.string().min(3).max(96).optional(),
    }).optional())
    .query(async ({ input }) => {
      return { items: await attestorService.persistence.listFaults(input?.operatorId) };
    }),

  rewards: publicProcedure
    .input(z.object({
      operatorId: z.string().min(3).max(96).optional(),
    }).optional())
    .query(async ({ input }) => {
      return { items: await attestorService.persistence.listRewards(input?.operatorId) };
    }),
});
