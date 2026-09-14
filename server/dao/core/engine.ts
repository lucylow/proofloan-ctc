import { randomUUID } from "node:crypto";
import type { Clock } from "./clock";
import { sha256Hex, proposalHash } from "./crypto";
import { GovernanceStore } from "./store";
import { DEFAULT_GOVERNANCE_CONFIG, KIND_RISK } from "./policy";
import { tallyProposal } from "./tally";
import { transition } from "./lifecycle";
import { constitutionCheck } from "./constitution";
import { validateProofLoanProposal } from "./guards";
import { DelegationEngine } from "./delegation";
import { computeEffectiveVotingPower } from "./votingPower";
import { timelockReady } from "./timelock";
import { treasurySpendAllowed } from "./treasuryChecks";
import { detectFlashLoanLikeChange, detectVoteBuying } from "../simulation/attackModels";
import { DryRunRiskGovernanceAdapter } from "../adapters/riskGovernanceAdapter";
import { DryRunAiGovernanceAdapter } from "../adapters/aiGovernanceAdapter";
import { DryRunAttestorGovernanceAdapter } from "../adapters/attestorGovernanceAdapter";
import { DryRunAtcGovernanceAdapter } from "../adapters/atcGovernanceAdapter";
import { DryRunChainExecutor } from "../adapters/chainExecution";
import {
  DaoError,
  isDaoError,
  parseGovernanceAmount,
  parseGovernanceTimestamp,
  parseSnapshotPower,
} from "../errors";
import type {
  GovernanceConfig,
  GovernanceMember,
  GovernanceProposal,
  ProposalAction,
  ProposalId,
  ProposalKind,
  VoteChoice,
} from "./types";

const DEMO_TREASURY_BALANCE = 1_000_000n;
const DEMO_TREASURY_RESERVE = 100_000n;
const MEMBER_ROLES = new Set<GovernanceMember["role"]>(["member", "delegate", "guardian", "operator"]);

function snapshotPowers(members: Map<string, GovernanceMember>): Record<string, string> {
  return Object.fromEntries(
    [...computeEffectiveVotingPower(members).entries()].map(([address, power]) => [address, power.toString()]),
  );
}

function boundedText(value: string, label: string, min: number, max: number): string {
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new DaoError("VALIDATION", `${label} must be between ${min} and ${max} characters`);
  }
  return text;
}

export class GovernanceEngine {
  readonly delegation: DelegationEngine;
  private readonly riskAdapter = new DryRunRiskGovernanceAdapter();
  private readonly aiAdapter = new DryRunAiGovernanceAdapter();
  private readonly attestorAdapter = new DryRunAttestorGovernanceAdapter();
  private readonly atcAdapter = new DryRunAtcGovernanceAdapter();
  private readonly chain = new DryRunChainExecutor();
  private readonly executing = new Set<ProposalId>();

  constructor(
    public readonly store: GovernanceStore,
    public readonly clock: Clock,
    public config: GovernanceConfig = DEFAULT_GOVERNANCE_CONFIG,
  ) {
    this.delegation = new DelegationEngine(store.members);
  }

  registerMember(member: GovernanceMember): void {
    const address = member.address.trim();
    if (!address) throw new DaoError("VALIDATION", "member address required");
    if (member.votingPower < 0n) throw new DaoError("VALIDATION", "negative voting power");
    if (!Number.isFinite(member.reputation)) throw new DaoError("VALIDATION", "invalid reputation");
    if (!MEMBER_ROLES.has(member.role)) throw new DaoError("VALIDATION", "invalid member role");
    this.store.putMember({ ...member, address });
  }

  createProposal(input: {
    proposer: string;
    title: string;
    description: string;
    kind: ProposalKind;
    actions: ProposalAction[];
    snapshotBlock: number;
  }): GovernanceProposal {
    const proposer = input.proposer.trim();
    if (!proposer) throw new DaoError("VALIDATION", "proposer is required");
    if (!Number.isInteger(input.snapshotBlock) || input.snapshotBlock < 0) {
      throw new DaoError("VALIDATION", "snapshotBlock must be a non-negative integer");
    }
    const member = this.store.getMember(proposer);
    if (!member?.active || member.votingPower < this.config.proposalThreshold) {
      throw new DaoError("THRESHOLD", "proposal threshold not met");
    }
    if (!(input.kind in KIND_RISK)) throw new DaoError("VALIDATION", "unsupported proposal kind");
    const risk = KIND_RISK[input.kind];
    if (!risk) throw new DaoError("VALIDATION", "unsupported proposal kind");
    if (!Array.isArray(input.actions) || input.actions.length === 0 || input.actions.length > this.config.maxActionsPerProposal) {
      throw new DaoError("THRESHOLD", "invalid action count");
    }
    for (const [index, action] of input.actions.entries()) {
      if (!action.target?.trim() || !action.selector?.trim() || !action.description?.trim()) {
        throw new DaoError("VALIDATION", `action ${index} is missing target, selector, or description`);
      }
      if (action.params == null || typeof action.params !== "object" || Array.isArray(action.params)) {
        throw new DaoError("VALIDATION", `action ${index} params must be an object`);
      }
    }

    const now = this.clock.now();
    if (!Number.isFinite(now)) throw new DaoError("VALIDATION", "governance clock is invalid");
    const start = now + this.config.votingDelaySeconds * 1000;
    const end = start + this.config.votingPeriodSeconds * 1000;
    const id = `dao-${randomUUID()}` as ProposalId;
    const proposal: GovernanceProposal = {
      id,
      title: boundedText(input.title, "title", 5, 160),
      description: boundedText(input.description, "description", 10, 5000),
      kind: input.kind,
      proposer,
      createdAt: this.clock.nowIso(),
      startAt: new Date(start).toISOString(),
      endAt: new Date(end).toISOString(),
      status: "draft",
      snapshotBlock: input.snapshotBlock,
      quorumBps: risk.quorumBps,
      approvalBps: risk.approvalBps,
      actions: input.actions,
      votes: [],
      metadata: {
        hash: sha256Hex(input),
        proposalHash: proposalHash({ id, actions: input.actions, snapshotBlock: input.snapshotBlock }),
        snapshotPower: snapshotPowers(this.store.members),
        requiresTimelock: risk.requiresTimelock,
      },
    };

    const errors = [
      ...validateProofLoanProposal(proposal),
      ...input.actions.flatMap(action => constitutionCheck({ target: action.target, selector: action.selector })),
    ];
    if (errors.length) throw new DaoError("CONSTITUTION", errors.join("; "));

    this.store.putProposal(proposal);
    return proposal;
  }

  activate(id: ProposalId): GovernanceProposal {
    const proposal = this.must(id);
    if (this.clock.now() < parseGovernanceTimestamp(proposal.startAt, "voting start")) {
      throw new DaoError("TIMELOCK", "voting delay not elapsed");
    }
    transition(proposal, "active");
    return proposal;
  }

  castVote(id: ProposalId, voter: string, choice: VoteChoice, reason?: string): void {
    const voterAddress = voter.trim();
    if (!voterAddress) throw new DaoError("VALIDATION", "voter is required");
    if (reason !== undefined && reason.length > 500) throw new DaoError("VALIDATION", "vote reason is too long");
    const proposal = this.must(id);
    if (proposal.status !== "active") throw new DaoError("VOTING", "proposal is not active");
    const now = this.clock.now();
    const start = parseGovernanceTimestamp(proposal.startAt, "voting start");
    const end = parseGovernanceTimestamp(proposal.endAt, "voting end");
    if (now < start || now > end) throw new DaoError("VOTING", "outside voting window");
    if (proposal.votes.some(vote => vote.voter === voterAddress)) throw new DaoError("VOTING", "vote already cast");
    const member = this.store.getMember(voterAddress);
    if (!member?.active) throw new DaoError("VOTING", "inactive voter");

    const snapshot = (proposal.metadata.snapshotPower ?? {}) as Record<string, string>;
    if (!(voterAddress in snapshot)) throw new DaoError("VOTING", "no snapshot voting power");
    const snapshotWeight = parseSnapshotPower(snapshot[voterAddress]);
    if (snapshotWeight <= 0n) throw new DaoError("VOTING", "no snapshot voting power");

    const currentWeight = computeEffectiveVotingPower(this.store.members).get(voterAddress) ?? 0n;
    try {
      const flash = detectFlashLoanLikeChange(snapshotWeight, currentWeight);
      const flashAlerts = Array.isArray(proposal.metadata.flashAlerts) ? proposal.metadata.flashAlerts as unknown[] : [];
      if (flash.detected) flashAlerts.push({ voter: voterAddress, ...flash });
      proposal.metadata = { ...proposal.metadata, flashAlerts };
    } catch {
      proposal.metadata = { ...proposal.metadata, flashDetectionFailed: true };
    }

    proposal.votes.push({
      voter: voterAddress,
      choice,
      weight: snapshotWeight,
      delegatedFrom: member.delegatedTo ? [] : [...this.store.members.values()].filter(item => item.delegatedTo === voterAddress).map(item => item.address),
      reason,
      castAt: this.clock.nowIso(),
    });
  }

  finalize(id: ProposalId): GovernanceProposal {
    const proposal = this.must(id);
    if (proposal.status !== "active") throw new DaoError("STATE", "not active");
    if (this.clock.now() <= parseGovernanceTimestamp(proposal.endAt, "voting end")) {
      throw new DaoError("TIMELOCK", "voting period not finished");
    }
    const tally = tallyProposal(proposal, this.store.members);
    let voteBuying;
    try {
      voteBuying = detectVoteBuying(proposal.votes);
    } catch (error) {
      voteBuying = { name: "vote-buying", detected: false, notes: [error instanceof Error ? error.message : "vote-buying detection failed"] };
    }
    transition(proposal, tally.passed ? "passed" : "rejected");
    proposal.metadata = {
      ...proposal.metadata,
      tally: {
        ...tally,
        forVotes: tally.forVotes.toString(),
        againstVotes: tally.againstVotes.toString(),
        abstainVotes: tally.abstainVotes.toString(),
        total: tally.total.toString(),
      },
      attacks: { voteBuying },
    };
    return proposal;
  }

  queue(id: ProposalId): GovernanceProposal {
    const proposal = this.must(id);
    if (proposal.status !== "passed") throw new DaoError("STATE", "proposal must pass");
    const risk = KIND_RISK[proposal.kind];
    if (!risk) throw new DaoError("VALIDATION", "unsupported proposal kind");
    const delaySeconds = risk.requiresTimelock ? this.config.executionDelaySeconds : 0;
    transition(proposal, "queued");
    proposal.eta = new Date(this.clock.now() + delaySeconds * 1000).toISOString();
    return proposal;
  }

  async execute(id: ProposalId): Promise<GovernanceProposal> {
    if (this.executing.has(id)) throw new DaoError("STATE", "proposal execution already in progress");
    this.executing.add(id);
    const proposal = this.must(id);
    try {
      if (proposal.status !== "queued") throw new DaoError("STATE", "proposal must be queued");
      if (!proposal.eta || !timelockReady(proposal.eta, this.clock.now())) {
        throw new DaoError("TIMELOCK", "timelock active");
      }

      const constitutional = proposal.actions.flatMap(action => constitutionCheck({ target: action.target, selector: action.selector }));
      if (constitutional.length) throw new DaoError("CONSTITUTION", constitutional.join("; "));

      for (const action of proposal.actions) {
        if (proposal.kind === "treasury") {
          const amount = parseGovernanceAmount(action.params.amount ?? action.value ?? "0", "treasury amount");
          if (!treasurySpendAllowed(DEMO_TREASURY_BALANCE, amount, DEMO_TREASURY_RESERVE)) {
            throw new DaoError("TREASURY", "treasury reserve check failed");
          }
        }
      }

      transition(proposal, "executing");
      try {
        const receipts = [];
        for (const [index, action] of proposal.actions.entries()) {
          const applied = await this.applyAction(proposal, action);
          if (!applied.txHash) throw new DaoError("EXECUTION", `action ${index} did not return a transaction hash`);
          const receipt = {
            proposalId: proposal.id,
            actionIndex: index,
            txHash: applied.txHash,
            executedAt: this.clock.nowIso(),
          };
          receipts.push(receipt);
          this.store.receipts.push(receipt);
        }

        proposal.executionHash = sha256Hex({ id: proposal.id, actions: proposal.actions, receipts, executedAt: this.clock.nowIso() });
        proposal.metadata = { ...proposal.metadata, receipts, dryRun: true, lastExecutionError: undefined };
        transition(proposal, "executed");
        return proposal;
      } catch (error) {
        this.rollbackFailedExecution(proposal, error);
        throw error;
      }
    } finally {
      this.executing.delete(id);
    }
  }

  cancel(id: ProposalId, actor?: string): void {
    const proposal = this.must(id);
    if (["executed", "cancelled", "expired"].includes(proposal.status)) {
      throw new DaoError("STATE", "cannot cancel");
    }
    if (proposal.status === "queued" || proposal.status === "executing") {
      if (this.store.getMember(actor?.trim() ?? "")?.role !== "guardian") {
        throw new DaoError("GUARDIAN", "guardian required to cancel queued or executing proposals");
      }
    }
    transition(proposal, "cancelled");
  }

  delegate(from: string, to: string): void {
    this.delegation.delegate(from, to);
  }

  private rollbackFailedExecution(proposal: GovernanceProposal, error: unknown): void {
    const detail = error instanceof Error ? error.message : "execution failed";
    proposal.metadata = { ...proposal.metadata, lastExecutionError: detail, dryRun: true };
    if (proposal.status !== "executing") return;
    try {
      transition(proposal, "queued");
    } catch (rollbackError) {
      proposal.metadata = {
        ...proposal.metadata,
        stuckExecuting: true,
        lastExecutionError: detail,
        rollbackError: rollbackError instanceof Error ? rollbackError.message : "rollback failed",
      };
    }
  }

  private async applyAction(proposal: GovernanceProposal, action: ProposalAction): Promise<{ txHash: string; applied: boolean }> {
    try {
      if (proposal.kind === "risk-policy" || proposal.kind === "parameter") {
        const check = await this.riskAdapter.validateProposal(proposal);
        if (!check.ok) throw new DaoError("EXECUTION", check.reasons.join("; ") || "risk adapter rejected the proposal");
        return this.riskAdapter.apply(proposal);
      }
      if (proposal.kind === "ai-model") {
        const check = await this.aiAdapter.validateProposal(proposal);
        if (!check.ok) throw new DaoError("EXECUTION", check.reasons.join("; ") || "AI adapter rejected the proposal");
        return this.aiAdapter.apply(proposal);
      }
      if (proposal.kind === "attestor-admission" || proposal.kind === "attestor-policy") {
        const check = await this.attestorAdapter.validateProposal(proposal);
        if (!check.ok) throw new DaoError("EXECUTION", check.reasons.join("; ") || "attestor adapter rejected the proposal");
        return this.attestorAdapter.apply(proposal);
      }
      if (proposal.kind === "atc-fee-policy" || proposal.kind === "treasury") {
        const check = await this.atcAdapter.validateProposal(proposal);
        if (!check.ok) throw new DaoError("EXECUTION", check.reasons.join("; ") || "ATC adapter rejected the proposal");
        return this.atcAdapter.apply(proposal);
      }
      const receipt = await this.chain.execute(action.target, action.selector, action.params, action.value);
      if (!receipt?.txHash) {
        throw new DaoError("EXECUTION", "chain executor did not return a transaction hash");
      }
      if (!receipt.accepted) {
        throw new DaoError("EXECUTION", "chain executor rejected the action");
      }
      return { txHash: receipt.txHash, applied: true };
    } catch (error) {
      if (isDaoError(error)) throw error;
      throw new DaoError(
        "EXECUTION",
        error instanceof Error ? error.message : "governance adapter failed",
        true,
        error,
      );
    }
  }

  private must(id: ProposalId): GovernanceProposal {
    const proposal = this.store.getProposal(id);
    if (!proposal) throw new DaoError("NOT_FOUND", "proposal not found");
    return proposal;
  }
}
