import { beforeEach, describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../../routers";
import type { TrpcContext } from "../../_core/context";
import { resetGovernanceDemo } from "./service";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("DAO governance router", () => {
  beforeEach(() => {
    resetGovernanceDemo();
  });

  it("exposes constitution, members, and templates", async () => {
    const caller = appRouter.createCaller(createContext());
    const summary = await caller.dao.summary();
    expect(summary.constitution.riskGuardCannotBeDisabledByStandardProposal).toBe(true);
    expect(summary.constitution.aiCannotMintEvidence).toBe(true);
    expect(summary.pipeline[0]).toBe("Verified evidence");
    expect(summary.members).toBe(5);

    const members = await caller.dao.members();
    expect(members.some(member => member.role === "guardian")).toBe(true);

    const templates = await caller.dao.templates();
    expect(templates.length).toBeGreaterThanOrEqual(10);
    expect(templates[0]?.kind).toBe("risk-policy");
  });

  it("creates and lists a RiskGuard evidence-floor proposal", async () => {
    const caller = appRouter.createCaller(createContext());
    const created = await caller.dao.createProposal({
      proposer: "member-alice",
      title: "Increase evidence floor",
      description: "Raise RiskGuard minimum evidence count without disabling the guard.",
      kind: "risk-policy",
      snapshotBlock: 8,
      actions: [
        {
          target: "proofloan",
          selector: "risk-policy:increase_evidence_floor",
          params: { minEvidenceCount: 5 },
          value: "0",
          description: "Raise minEvidenceCount to 5",
        },
      ],
    });

    expect(created.id.startsWith("dao-")).toBe(true);
    expect(created.status).toBe("draft");
    const listed = await caller.dao.proposals();
    expect(listed.some(proposal => proposal.id === created.id)).toBe(true);
  });

  it("refuses to create a proposal that disables RiskGuard", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.dao.createProposal({
        proposer: "member-alice",
        title: "Turn off RiskGuard",
        description: "This must be rejected by the constitution.",
        kind: "risk-policy",
        snapshotBlock: 1,
        actions: [
          {
            target: "proofloan",
            selector: "RiskGuard:disableRiskGuard",
            params: {},
            value: "0",
            description: "illegal",
          },
        ],
      }),
    ).rejects.toThrow(/RiskGuard cannot be disabled/);
  });

  it("maps missing proposals to NOT_FOUND and invalid ids to BAD_REQUEST", async () => {
    const caller = appRouter.createCaller(createContext());

    try {
      await caller.dao.activate({ id: "dao-missing-id" });
      throw new Error("expected missing proposal to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("NOT_FOUND");
      expect((error as Error).message).toMatch(/proposal not found/);
    }

    try {
      await caller.dao.vote({ id: "not-a-dao-id", voter: "member-alice", choice: "for" });
      throw new Error("expected invalid proposal id to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("BAD_REQUEST");
      expect((error as Error).message).toMatch(/invalid proposal id/);
    }
  });

  it("requires a guardian to cancel a queued proposal", async () => {
    const caller = appRouter.createCaller(createContext());
    const created = await caller.dao.createProposal({
      proposer: "member-alice",
      title: "Increase evidence floor",
      description: "Raise RiskGuard minimum evidence count without disabling the guard.",
      kind: "risk-policy",
      snapshotBlock: 8,
      actions: [
        {
          target: "proofloan",
          selector: "risk-policy:increase_evidence_floor",
          params: { minEvidenceCount: 5 },
          value: "0",
          description: "Raise minEvidenceCount to 5",
        },
      ],
    });
    await caller.dao.advance({ seconds: 3600 });
    await caller.dao.activate({ id: created.id });
    await caller.dao.vote({ id: created.id, voter: "member-alice", choice: "for" });
    await caller.dao.vote({ id: created.id, voter: "member-bob", choice: "for" });
    await caller.dao.advance({ seconds: 3 * 24 * 60 * 60 + 1 });
    await caller.dao.finalize({ id: created.id });
    await caller.dao.queue({ id: created.id });

    try {
      await caller.dao.cancel({ id: created.id, actor: "member-alice" });
      throw new Error("expected non-guardian cancel to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("FORBIDDEN");
      expect((error as Error).message).toMatch(/guardian required/);
    }
  });
});
