import { describe, expect, it } from "vitest";
import { FixedClock } from "../core/clock";
import { GovernanceEngine } from "../core/engine";
import { GovernanceStore } from "../core/store";
import { DEFAULT_GOVERNANCE_CONFIG } from "../core/policy";
import type { GovernanceMember, ProposalAction } from "../core/types";
import { proposalFixture001 } from "../fixtures/proposal_001_increase_evidence_floor.ts";

function member(address: string, votingPower: bigint, role: GovernanceMember["role"] = "member"): GovernanceMember {
  return { address, votingPower, active: true, role, reputation: 70 };
}

function engine(epoch = Date.parse("2026-01-01T00:00:00.000Z")) {
  const clock = new FixedClock(epoch);
  const store = new GovernanceStore();
  const gov = new GovernanceEngine(store, clock, {
    ...DEFAULT_GOVERNANCE_CONFIG,
    votingDelaySeconds: 60,
    votingPeriodSeconds: 600,
    executionDelaySeconds: 120,
    proposalThreshold: 100n,
  });
  gov.registerMember(member("alice", 500n));
  gov.registerMember(member("bob", 400n));
  gov.registerMember(member("carol", 300n));
  gov.registerMember(member("guardian", 200n, "guardian"));
  return { gov, clock };
}

const evidenceAction = proposalFixture001.actions[0] as ProposalAction;

describe("ProofLoan governance engine", () => {
  it("rejects constitutional attempts to disable RiskGuard", () => {
    const { gov } = engine();
    expect(() =>
      gov.createProposal({
        proposer: "alice",
        title: "Disable RiskGuard",
        description: "Standard governance must not remove the RiskGuard boundary.",
        kind: "risk-policy",
        snapshotBlock: 1,
        actions: [{ target: "proofloan", selector: "RiskGuard:disableRiskGuard", params: {}, value: "0", description: "illegal disable" }],
      }),
    ).toThrow(/RiskGuard cannot be disabled/);
  });

  it("rejects unverified-evidence proposals", () => {
    const { gov } = engine();
    expect(() =>
      gov.createProposal({
        proposer: "alice",
        title: "Make AI evidence authoritative",
        description: "DAO cannot vote blockchain evidence into existence.",
        kind: "ai-model",
        snapshotBlock: 1,
        actions: [{ target: "proofloan", selector: "model:acceptUnverifiedEvidence", params: {}, value: "0", description: "illegal evidence" }],
      }),
    ).toThrow(/Unverified evidence/);
  });

  it("detects delegation cycles", () => {
    const { gov } = engine();
    gov.delegate("alice", "bob");
    gov.delegate("bob", "carol");
    expect(() => gov.delegate("carol", "alice")).toThrow(/cycle/i);
  });

  it("runs a timelocked evidence-floor proposal to dry-run execution", async () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: proposalFixture001.title,
      description: "Raise the minimum evidence count used by RiskGuard.",
      kind: "risk-policy",
      snapshotBlock: 12,
      actions: [evidenceAction],
    });

    expect(() => gov.activate(proposal.id)).toThrow(/voting delay/);
    clock.advance(60_000);
    expect(gov.activate(proposal.id).status).toBe("active");

    gov.castVote(proposal.id, "alice", "for", "evidence-first");
    gov.castVote(proposal.id, "bob", "for");
    gov.castVote(proposal.id, "carol", "abstain");
    expect(() => gov.finalize(proposal.id)).toThrow(/voting period not finished/);

    clock.advance(601_000);
    expect(gov.finalize(proposal.id).status).toBe("passed");
    const queued = gov.queue(proposal.id);
    expect(queued.status).toBe("queued");
    expect(queued.eta).toBeTruthy();
    await expect(gov.execute(proposal.id)).rejects.toThrow(/timelock/);

    clock.advance(120_000);
    const executed = await gov.execute(proposal.id);
    expect(executed.status).toBe("executed");
    expect(executed.executionHash?.startsWith("0x")).toBe(true);
    expect(executed.metadata.dryRun).toBe(true);
  });

  it("uses snapshot voting power instead of later inflated balances", () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: proposalFixture001.title,
      description: "Snapshot should freeze vote weights.",
      kind: "risk-policy",
      snapshotBlock: 4,
      actions: [evidenceAction],
    });
    clock.advance(60_000);
    gov.activate(proposal.id);
    const alice = gov.store.getMember("alice");
    if (alice) alice.votingPower = 50_000n;
    gov.castVote(proposal.id, "alice", "for");
    expect(proposal.votes[0]?.weight).toBe(500n);
  });

  it("rolls a failed execution back to queued instead of leaving it stuck", async () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: proposalFixture001.title,
      description: "Execution failure should be recoverable.",
      kind: "risk-policy",
      snapshotBlock: 12,
      actions: [evidenceAction],
    });
    clock.advance(60_000);
    gov.activate(proposal.id);
    gov.castVote(proposal.id, "alice", "for");
    gov.castVote(proposal.id, "bob", "for");
    clock.advance(601_000);
    gov.finalize(proposal.id);
    gov.queue(proposal.id);
    clock.advance(120_000);

    const adapters = gov as unknown as { riskAdapter: { apply: (p: unknown) => Promise<unknown> } };
    adapters.riskAdapter.apply = async () => {
      throw new Error("adapter down");
    };

    await expect(gov.execute(proposal.id)).rejects.toThrow(/adapter down/);
    expect(proposal.status).toBe("queued");
    expect(String(proposal.metadata.lastExecutionError)).toMatch(/adapter down/);
  });

  it("rejects malformed treasury amounts before execution", async () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: "Fund audit treasury",
      description: "Treasury spend must parse as an integer amount.",
      kind: "treasury",
      snapshotBlock: 3,
      actions: [
        {
          target: "atc",
          selector: "atc:fee-policy",
          params: { amount: "not-a-number" },
          value: "0",
          description: "Invalid treasury amount",
        },
      ],
    });
    clock.advance(60_000);
    gov.activate(proposal.id);
    gov.castVote(proposal.id, "alice", "for");
    gov.castVote(proposal.id, "bob", "for");
    clock.advance(601_000);
    gov.finalize(proposal.id);
    gov.queue(proposal.id);
    clock.advance(120_000);
    await expect(gov.execute(proposal.id)).rejects.toThrow(/invalid treasury amount/);
    expect(proposal.status).toBe("queued");
  });

  it("rejects chain actions that are not accepted", async () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: "Update protocol config",
      description: "Chain executor rejection should roll the proposal back.",
      kind: "protocol-config",
      snapshotBlock: 9,
      actions: [
        {
          target: "proofloan",
          selector: "protocol-config:update_protocol_config",
          params: { maxActions: 10 },
          value: "0",
          description: "Update max actions",
        },
      ],
    });
    clock.advance(60_000);
    gov.activate(proposal.id);
    gov.castVote(proposal.id, "alice", "for");
    gov.castVote(proposal.id, "bob", "for");
    clock.advance(601_000);
    gov.finalize(proposal.id);
    gov.queue(proposal.id);
    clock.advance(120_000);

    const adapters = gov as unknown as { chain: { execute: () => Promise<{ txHash: string; accepted: boolean }> } };
    adapters.chain.execute = async () => ({ txHash: "0xdead", accepted: false });

    await expect(gov.execute(proposal.id)).rejects.toThrow(/chain executor rejected/);
    expect(proposal.status).toBe("queued");
  });

  it("rejects unknown members and inactive voters with typed errors", () => {
    const { gov, clock } = engine();
    const proposal = gov.createProposal({
      proposer: "alice",
      title: proposalFixture001.title,
      description: "Unknown voters must not be able to vote.",
      kind: "risk-policy",
      snapshotBlock: 4,
      actions: [evidenceAction],
    });
    clock.advance(60_000);
    gov.activate(proposal.id);
    expect(() => gov.castVote(proposal.id, "mallory", "for")).toThrow(/inactive voter|snapshot voting power/);
    expect(() => gov.activate("dao-missing-id" as never)).toThrow(/proposal not found/);
  });
});
