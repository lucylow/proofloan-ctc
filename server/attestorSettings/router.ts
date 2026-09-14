import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { attestorNetworkSchema, operatorConfigSchema } from "@shared/attestorSettings";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { router, publicProcedure } from "../_core/trpc";
import { buildDiagnostics } from "./diagnostics";
import { generateYaml } from "./configGenerator";
import { getAttestorSettings, allAttestorSettings } from "./registry";
import { publicManifest } from "./serialization";
import { dockerRunCommand } from "./releasePolicy";
import { operatorLinks } from "./docsLinks";
import { template } from "./operatorConfigTemplate";
import { settingsFingerprint } from "./settingsFingerprint";
import { actionPlan } from "./operatorActions";
import { nextActions } from "./lifecycle";
import { assessSettingsHealth } from "./health";
import { numericHealthScore } from "./healthScore";
import { networkFacts } from "./networkFacts";
import { reconcileChainState } from "./reconciliation";
import { detectDrift } from "./configurationDrift";
import { operatorNotes } from "./operatorNotes";
import { operatingCostHints } from "./costPolicy";
import { precompileMap } from "./precompiles";
import { validateOperatorConfig } from "./validation";

const lifecycleInput = z.object({
  network: attestorNetworkSchema,
  status: z.enum(["None", "Idle", "Waiting", "Active", "Leaving"]),
  authorized: z.boolean(),
});

function withSettingsQuery<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message = error instanceof Error ? error.message : "Attestor settings request failed.";
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `[${PROOFLOAN_ERROR_CODES.OPERATOR}] ${message}`,
    });
  }
}

export const attestorSettingsRouter = router({
  list: publicProcedure.query(() => withSettingsQuery(() => allAttestorSettings().map(item => publicManifest(item.environment)))),

  get: publicProcedure
    .input(z.object({ network: attestorNetworkSchema }))
    .query(({ input }) => withSettingsQuery(() => publicManifest(input.network))),

  facts: publicProcedure
    .input(z.object({ network: attestorNetworkSchema }))
    .query(({ input }) =>
      withSettingsQuery(() => ({
        ...networkFacts(input.network),
        links: operatorLinks(input.network),
        notes: operatorNotes(input.network),
        costs: operatingCostHints(input.network),
        precompiles: precompileMap(input.network),
        fingerprint: settingsFingerprint(input.network),
      })),
    ),

  diagnostics: publicProcedure
    .input(z.object({ network: attestorNetworkSchema, config: operatorConfigSchema }))
    .query(({ input }) => withSettingsQuery(() => buildDiagnostics(input.network, input.config))),

  configYaml: publicProcedure
    .input(z.object({ network: attestorNetworkSchema, config: operatorConfigSchema }))
    .mutation(({ input }) =>
      withSettingsQuery(() => {
        const validation = validateOperatorConfig(input.network, input.config);
        const blocking = validation.issues.filter(issue => issue.severity === "error");
        if (blocking.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `[${PROOFLOAN_ERROR_CODES.OPERATOR}] ${blocking.map(issue => issue.message).join("; ")}`,
          });
        }
        return generateYaml(input.network, input.config);
      }),
    ),

  template: publicProcedure
    .input(z.object({ network: attestorNetworkSchema }))
    .query(({ input }) => withSettingsQuery(() => template(input.network))),

  officialRelease: publicProcedure
    .input(z.object({ network: attestorNetworkSchema }))
    .query(({ input }) =>
      withSettingsQuery(() => {
        const item = getAttestorSettings(input.network);
        return {
          network: item.environment,
          image: item.releaseImage,
          chainKey: item.chainKey,
          sourceChainId: item.sourceChainId,
          docker: dockerRunCommand(input.network, {
            configPath: "./config.yaml",
            logsPath: "./logs",
            dataPath: "./data",
          }),
        };
      }),
    ),

  health: publicProcedure
    .input(z.object({ network: attestorNetworkSchema, config: operatorConfigSchema }))
    .query(({ input }) =>
      withSettingsQuery(() => ({
        ...assessSettingsHealth(input.network, input.config),
        score: numericHealthScore(input.network, input.config),
      })),
    ),

  plan: publicProcedure
    .input(lifecycleInput.extend({ config: operatorConfigSchema }))
    .query(({ input }) =>
      withSettingsQuery(() => actionPlan(input.network, { status: input.status, authorized: input.authorized }, input.config)),
    ),

  lifecycle: publicProcedure
    .input(lifecycleInput)
    .query(({ input }) =>
      withSettingsQuery(() => ({
        actions: nextActions(input.network, input.status, input.authorized),
        electionMode: getAttestorSettings(input.network).electionMode,
      })),
    ),

  reconcile: publicProcedure
    .input(z.object({
      network: attestorNetworkSchema,
      chainKey: z.number().int().nonnegative(),
      sourceChainId: z.number().int().optional(),
      genesisBlock: z.number().int().optional(),
    }))
    .query(({ input }) => withSettingsQuery(() => reconcileChainState(input.network, input))),

  drift: publicProcedure
    .input(z.object({
      network: attestorNetworkSchema,
      chainKey: z.number().int().nonnegative(),
      releaseImage: z.string().min(1),
      cc3Url: z.string().min(1),
    }))
    .query(({ input }) => withSettingsQuery(() => detectDrift(input.network, input))),
});
