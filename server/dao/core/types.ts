export type ProposalId = `dao-${string}`;
export type Address = string;
export type ProposalStatus = "draft" | "queued" | "active" | "passed" | "rejected" | "executing" | "executed" | "cancelled" | "expired";
export type VoteChoice = "for" | "against" | "abstain";
export type ProposalKind =
  | "risk-policy"
  | "ai-model"
  | "attestor-admission"
  | "attestor-policy"
  | "atc-fee-policy"
  | "treasury"
  | "protocol-config"
  | "emergency"
  | "environment"
  | "parameter";

export interface Vote {
  voter: Address;
  choice: VoteChoice;
  weight: bigint;
  delegatedFrom: Address[];
  reason?: string;
  castAt: string;
}

export interface ProposalAction {
  target: string;
  selector: string;
  params: Record<string, unknown>;
  value: string;
  description: string;
}

export interface GovernanceProposal {
  id: ProposalId;
  title: string;
  description: string;
  kind: ProposalKind;
  proposer: Address;
  createdAt: string;
  startAt: string;
  endAt: string;
  eta?: string;
  status: ProposalStatus;
  snapshotBlock: number;
  quorumBps: number;
  approvalBps: number;
  actions: ProposalAction[];
  votes: Vote[];
  metadata: Record<string, unknown>;
  executionHash?: string;
}

export interface GovernanceMember {
  address: Address;
  votingPower: bigint;
  delegatedTo?: Address;
  stakedAt?: string;
  active: boolean;
  role: "member" | "delegate" | "guardian" | "operator";
  reputation: number;
}

export interface GovernanceConfig {
  votingDelaySeconds: number;
  votingPeriodSeconds: number;
  executionDelaySeconds: number;
  quorumBps: number;
  approvalBps: number;
  proposalThreshold: bigint;
  guardianThreshold: bigint;
  emergencyCooldownSeconds: number;
  maxActionsPerProposal: number;
}

export interface VoteTally {
  total: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  participationBps: number;
  approvalBps: number;
  quorumReached: boolean;
  passed: boolean;
}

export interface ProposalReceipt {
  proposalId: ProposalId;
  actionIndex: number;
  txHash: string;
  executedAt: string;
}
