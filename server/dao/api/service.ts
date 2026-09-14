import { GovernanceEngine } from "../core/engine";
import { GovernanceStore } from "../core/store";
import { FixedClock } from "../core/clock";
import { DEFAULT_GOVERNANCE_CONFIG } from "../core/policy";
import { PROOFLOAN_CONSTITUTION } from "../core/constitution";
import { DEFAULT_PROOFLOAN_POLICY } from "../policies/proofloanPolicy";
import { DEFAULT_AI_MODEL_POLICY } from "../policies/aiModelPolicy";
import { DEFAULT_ATTESTOR_GOVERNANCE_POLICY } from "../policies/attestorPolicy";
import { DEFAULT_ATC_GOVERNANCE_POLICY } from "../policies/atcPolicy";
import { DEFAULT_EMERGENCY_POLICY } from "../policies/emergencyPolicy";
import { proposalFixture001 } from "../fixtures/proposal_001_increase_evidence_floor.ts";
import { proposalFixture002 } from "../fixtures/proposal_002_raise_ai_confidence.ts";
import { proposalFixture003 } from "../fixtures/proposal_003_admit_new_attestor.ts";
import { proposalFixture004 } from "../fixtures/proposal_004_update_attestor_quorum.ts";
import { proposalFixture005 } from "../fixtures/proposal_005_rebalance_atc_fees.ts";
import { proposalFixture006 } from "../fixtures/proposal_006_fund_audit_treasury.ts";
import { proposalFixture007 } from "../fixtures/proposal_007_update_protocol_config.ts";
import { proposalFixture008 } from "../fixtures/proposal_008_emergency_freeze_offers.ts";
import { proposalFixture009 } from "../fixtures/proposal_009_enable_testnet_env.ts";
import { proposalFixture010 } from "../fixtures/proposal_010_adjust_proof_timeout.ts";
import { DaoError } from "../errors";
import type { GovernanceMember, GovernanceProposal, ProposalId } from "../core/types";

export const DEMO_GOVERNANCE_EPOCH_MS = Date.parse("2026-09-13T14:00:00.000Z");

const DEMO_MEMBERS: GovernanceMember[] = [
  { address: "member-alice", votingPower: 5000n, active: true, role: "member", reputation: 82 },
  { address: "member-bob", votingPower: 3500n, active: true, role: "delegate", reputation: 74 },
  { address: "member-carol", votingPower: 2500n, active: true, role: "member", reputation: 66 },
  { address: "guardian-proofloan", votingPower: 4000n, active: true, role: "guardian", reputation: 96 },
  { address: "operator-attestor", votingPower: 1500n, active: true, role: "operator", reputation: 61 },
];

export const governanceTemplates = [
  proposalFixture001,
  proposalFixture002,
  proposalFixture003,
  proposalFixture004,
  proposalFixture005,
  proposalFixture006,
  proposalFixture007,
  proposalFixture008,
  proposalFixture009,
  proposalFixture010,
];

export const governanceClock = new FixedClock(DEMO_GOVERNANCE_EPOCH_MS);
export const governanceStore = new GovernanceStore();
export const governanceEngine = new GovernanceEngine(governanceStore, governanceClock, DEFAULT_GOVERNANCE_CONFIG);

function seedMembers(): void {
  for (const member of DEMO_MEMBERS) {
    governanceEngine.registerMember({ ...member });
  }
}

seedMembers();

export function resetGovernanceDemo(): void {
  governanceStore.proposals.clear();
  governanceStore.members.clear();
  governanceStore.receipts.length = 0;
  governanceStore.delegation.clear();
  governanceClock.reset(DEMO_GOVERNANCE_EPOCH_MS);
  seedMembers();
}

export function serializeProposal(proposal: GovernanceProposal) {
  try {
    return {
      ...proposal,
      votes: proposal.votes.map(vote => ({ ...vote, weight: vote.weight.toString() })),
    };
  } catch (error) {
    throw new DaoError("UNKNOWN", error instanceof Error ? error.message : "unable to serialize proposal", false, error);
  }
}

export function serializeMember(member: GovernanceMember) {
  try {
    return {
      ...member,
      votingPower: member.votingPower.toString(),
    };
  } catch (error) {
    throw new DaoError("UNKNOWN", error instanceof Error ? error.message : "unable to serialize member", false, error);
  }
}

export function asProposalId(id: string): ProposalId {
  const trimmed = id.trim();
  if (!trimmed.startsWith("dao-") || trimmed.length < 8 || trimmed.length > 80 || /\s/.test(trimmed)) {
    throw new DaoError("VALIDATION", "invalid proposal id");
  }
  return trimmed as ProposalId;
}

export function governanceSummary() {
  const proposals = [...governanceStore.proposals.values()];
  return {
    proposalCount: proposals.length,
    active: proposals.filter(proposal => proposal.status === "active").length,
    passed: proposals.filter(proposal => proposal.status === "passed").length,
    queued: proposals.filter(proposal => proposal.status === "queued").length,
    executed: proposals.filter(proposal => proposal.status === "executed").length,
    members: governanceStore.members.size,
    now: governanceClock.nowIso(),
    config: {
      ...DEFAULT_GOVERNANCE_CONFIG,
      proposalThreshold: DEFAULT_GOVERNANCE_CONFIG.proposalThreshold.toString(),
      guardianThreshold: DEFAULT_GOVERNANCE_CONFIG.guardianThreshold.toString(),
    },
    constitution: PROOFLOAN_CONSTITUTION,
    policies: {
      proofloan: DEFAULT_PROOFLOAN_POLICY,
      ai: DEFAULT_AI_MODEL_POLICY,
      attestor: DEFAULT_ATTESTOR_GOVERNANCE_POLICY,
      atc: DEFAULT_ATC_GOVERNANCE_POLICY,
      emergency: DEFAULT_EMERGENCY_POLICY,
    },
    pipeline: [
      "Verified evidence",
      "ProofLoan AI",
      "RiskGuard",
      "DAO parameter governance",
      "Timelock",
      "Execution",
    ],
  };
}
