import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../../_core/trpc";
import { PROOFLOAN_ERROR_CODES } from "@shared/proofloan";
import { normalizeDaoError, trpcCodeForDaoError } from "../errors";
import {
  asProposalId,
  governanceEngine,
  governanceClock,
  governanceStore,
  governanceSummary,
  governanceTemplates,
  serializeMember,
  serializeProposal,
} from "./service";
import type { ProposalKind, VoteChoice } from "../core/types";

const proposalKinds = [
  "risk-policy",
  "ai-model",
  "attestor-admission",
  "attestor-policy",
  "atc-fee-policy",
  "treasury",
  "protocol-config",
  "emergency",
  "environment",
  "parameter",
] as const satisfies readonly ProposalKind[];

const voteChoices = ["for", "against", "abstain"] as const satisfies readonly VoteChoice[];
const proposalIdInput = z.string().trim().min(8).max(80);
const actorInput = z.string().trim().min(3).max(128);

function runGovernance<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeDaoError(error);
    throw new TRPCError({
      code: trpcCodeForDaoError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.DAO}] ${normalized.message}`,
    });
  }
}

async function runGovernanceAsync<T>(operation: () => Promise<T> | T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const normalized = normalizeDaoError(error);
    throw new TRPCError({
      code: trpcCodeForDaoError(normalized),
      message: `[${PROOFLOAN_ERROR_CODES.DAO}] ${normalized.message}`,
    });
  }
}

export const daoRouter = router({
  summary: publicProcedure.query(() => runGovernance(() => governanceSummary())),
  constitution: publicProcedure.query(() => runGovernance(() => governanceSummary().constitution)),
  templates: publicProcedure.query(() => runGovernance(() => governanceTemplates)),
  members: publicProcedure.query(() => runGovernance(() => [...governanceStore.members.values()].map(serializeMember))),
  proposals: publicProcedure.query(() => runGovernance(() => [...governanceStore.proposals.values()].map(serializeProposal))),
  proposal: publicProcedure.input(z.object({ id: proposalIdInput })).query(({ input }) =>
    runGovernance(() => {
      const proposal = governanceStore.getProposal(asProposalId(input.id));
      return proposal ? serializeProposal(proposal) : null;
    }),
  ),
  createProposal: publicProcedure
    .input(
      z.object({
        proposer: actorInput,
        title: z.string().trim().min(5).max(160),
        description: z.string().trim().min(10).max(5000),
        kind: z.enum(proposalKinds),
        snapshotBlock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
        actions: z
          .array(
            z.object({
              target: z.string().trim().min(1).max(128),
              selector: z.string().trim().min(1).max(160),
              params: z.record(z.string(), z.unknown()),
              value: z.string().max(78),
              description: z.string().trim().min(3).max(500),
            }),
          )
          .min(1)
          .max(12),
      }),
    )
    .mutation(({ input }) => runGovernance(() => serializeProposal(governanceEngine.createProposal(input)))),
  activate: publicProcedure.input(z.object({ id: proposalIdInput })).mutation(({ input }) =>
    runGovernance(() => serializeProposal(governanceEngine.activate(asProposalId(input.id)))),
  ),
  vote: publicProcedure
    .input(
      z.object({
        id: proposalIdInput,
        voter: actorInput,
        choice: z.enum(voteChoices),
        reason: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(({ input }) => {
      runGovernance(() => governanceEngine.castVote(asProposalId(input.id), input.voter, input.choice, input.reason));
      return { ok: true as const };
    }),
  finalize: publicProcedure.input(z.object({ id: proposalIdInput })).mutation(({ input }) =>
    runGovernance(() => serializeProposal(governanceEngine.finalize(asProposalId(input.id)))),
  ),
  queue: publicProcedure.input(z.object({ id: proposalIdInput })).mutation(({ input }) =>
    runGovernance(() => serializeProposal(governanceEngine.queue(asProposalId(input.id)))),
  ),
  execute: publicProcedure.input(z.object({ id: proposalIdInput })).mutation(({ input }) =>
    runGovernanceAsync(async () => serializeProposal(await governanceEngine.execute(asProposalId(input.id)))),
  ),
  cancel: publicProcedure.input(z.object({ id: proposalIdInput, actor: actorInput.optional() })).mutation(({ input }) => {
    runGovernance(() => governanceEngine.cancel(asProposalId(input.id), input.actor));
    return { ok: true as const };
  }),
  delegate: publicProcedure
    .input(z.object({ from: actorInput, to: actorInput }))
    .mutation(({ input }) => {
      runGovernance(() => governanceEngine.delegate(input.from, input.to));
      return { ok: true as const };
    }),
  advance: publicProcedure.input(z.object({ seconds: z.number().int().min(1).max(60 * 60 * 24 * 30) })).mutation(({ input }) =>
    runGovernance(() => {
      governanceClock.advance(input.seconds * 1000);
      return { now: governanceClock.nowIso() };
    }),
  ),
});
