import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { attestorOperatorService } from "./instance";
import { publicOperatorSummary, supportedOperatorActions } from "./api";
import { OperatorDiagnostics } from "./diagnostics";
import { prometheusText } from "./metricsText";
import { onboardingChecks, type OnboardingStage } from "./operatorOnboarding";
import { incidentRunbook, startupChecklist } from "./runbook";
import { authorizedAttestorQuery, attestorQuery, activeAttestorsQuery, supportedChainsQuery, eventNames } from "./onChainQueries";
import { assessElection } from "./election";
import { buildEnvironmentManifest } from "./environmentManifest";
import { buildExtrinsic, commandExplanation } from "./commands";
import { renderOperatorSummary } from "./cliSummary";
import { safeConfigPreview } from "./docker";
import { inspectSecret } from "./security";
import { currentEpoch, secondsToEpochEnd } from "./epoch";
import { officialOperatorPolicy } from "./policy";
import { normalizeOperatorError, parseBoundedInteger, trpcCodeForOperatorError } from "./errors";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";

const actionInput = z.enum([
  "authorize",
  "register",
  "signal",
  "chill",
  "unregister",
  "withdraw-unbonded",
  "restart",
  "rotate-rpc",
  "rotate-secret",
]);

const onboardingStageInput = z.enum([
  "accounts",
  "rpc",
  "funding",
  "authorization",
  "registration",
  "startup",
  "election",
  "active",
]);

function withOperatorQuery<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    const normalized = normalizeOperatorError(error);
    throw new TRPCError({
      code: trpcCodeForOperatorError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.OPERATOR}] ${normalized.message}`,
    });
  }
}

function currentPolicy() {
  try {
    return attestorOperatorService.policy();
  } catch {
    return officialOperatorPolicy(attestorOperatorService.operator.environment);
  }
}

function currentHealth() {
  const policy = currentPolicy();
  return attestorOperatorService.health({
    processHealthy: true,
    p2pReachable: process.env.ATTESTOR_P2P_REACHABLE === "true",
    attestationLagBlocks: parseBoundedInteger(process.env.ATTESTOR_LAG_BLOCKS, 0, { min: 0 }),
    epochSecondsRemaining: secondsToEpochEnd(
      Date.now(),
      parseBoundedInteger(process.env.ATTESTOR_GENESIS_MS, 0, { min: 0 }),
      policy.epochSeconds,
    ),
  });
}

export const attestorOperatorRouter = router({
  summary: publicProcedure.query(() => withOperatorQuery(() => {
    const readiness = attestorOperatorService.evaluateCurrent();
    const policy = currentPolicy();
    return {
      ...publicOperatorSummary({
        operatorId: attestorOperatorService.operator.operatorId,
        environment: attestorOperatorService.operator.environment,
        chainKey: attestorOperatorService.operator.chainKey,
        status: attestorOperatorService.operator.state.status,
        readiness,
      }),
      electionMode: policy.electionMode,
      authorized: attestorOperatorService.operator.state.authorized,
      registered: attestorOperatorService.operator.state.registered,
      scoreBps: readiness.scoreBps,
      cli: renderOperatorSummary({
        policy,
        state: attestorOperatorService.operator.state,
        config: attestorOperatorService.operator.node,
        readiness,
      }),
    };
  })),

  readiness: publicProcedure.query(() => withOperatorQuery(() => attestorOperatorService.evaluateCurrent())),

  health: publicProcedure.query(() => withOperatorQuery(() => currentHealth())),

  diagnostics: publicProcedure.query(() => withOperatorQuery(() => {
    const diagnostics = new OperatorDiagnostics(attestorOperatorService.rpc);
    const secret = inspectSecret(attestorOperatorService.operator.node.secret);
    return {
      config: OperatorDiagnostics.config(attestorOperatorService.operator.node),
      rpc: diagnostics.rpcResults(),
      p2p: diagnostics.p2p(process.env.ATTESTOR_P2P_REACHABLE === "true", attestorOperatorService.operator.node.publicAddress),
      secretFormat: { ok: secret.ok, severity: secret.severity, message: secret.message },
      preview: safeConfigPreview(attestorOperatorService.operator.node),
      epoch: currentEpoch(
        Date.now(),
        parseBoundedInteger(process.env.ATTESTOR_GENESIS_MS, 0, { min: 0 }),
        currentPolicy().epochSeconds,
      ),
    };
  })),

  metrics: publicProcedure.query(() => withOperatorQuery(() => attestorOperatorService.metrics.snapshot())),

  metricsText: publicProcedure.query(() => withOperatorQuery(() => prometheusText(attestorOperatorService.metrics))),

  plan: publicProcedure.input(z.object({ action: actionInput })).query(({ input }) => withOperatorQuery(() => {
    const readiness = attestorOperatorService.evaluateCurrent();
    const plan = attestorOperatorService.actionPlan(input.action, readiness);
    return {
      plan,
      explanation: commandExplanation(input.action, plan),
      extrinsic: buildExtrinsic(input.action, {
        chainKey: attestorOperatorService.operator.chainKey,
        attestorAddress: attestorOperatorService.operator.attestor.address,
      }),
      submitted: false,
      note: "ProofLoan returns a safe action plan and never automatically submits attestor extrinsics.",
    };
  })),

  actions: publicProcedure.query(() => ({ actions: supportedOperatorActions })),

  onboarding: publicProcedure.input(z.object({ stage: onboardingStageInput.optional() }).optional()).query(({ input }) => withOperatorQuery(() => {
    const stage = (input?.stage ?? "accounts") as OnboardingStage;
    return { stage, checks: onboardingChecks(stage, attestorOperatorService.operator.environment) };
  })),

  runbook: publicProcedure.query(() => withOperatorQuery(() => {
    const readiness = attestorOperatorService.evaluateCurrent();
    return {
      startup: startupChecklist(),
      incident: incidentRunbook(readiness),
      boundary: "This layer does not replace gluwa/creditcoin3, governance authorization, or official boot-node values.",
    };
  })),

  queries: publicProcedure.query(() => withOperatorQuery(() => {
    const { environment, chainKey, attestor } = attestorOperatorService.operator;
    return {
      authorized: authorizedAttestorQuery(environment, chainKey, attestor.address),
      attestor: attestorQuery(chainKey, attestor.address),
      active: activeAttestorsQuery(chainKey),
      supportedChains: supportedChainsQuery(),
      events: eventNames(),
    };
  })),

  election: publicProcedure.query(() => withOperatorQuery(() => assessElection(attestorOperatorService.operator.state, currentPolicy()))),

  history: publicProcedure.query(() => withOperatorQuery(() => attestorOperatorService.stateMachine.history(attestorOperatorService.operator.operatorId))),

  environment: publicProcedure.query(() => withOperatorQuery(() => buildEnvironmentManifest(attestorOperatorService.operator.environment, attestorOperatorService.operator.node.cc3?.url))),
});
