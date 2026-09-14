import type { GovernanceConfig, ProposalKind } from "./types";
export const DEFAULT_GOVERNANCE_CONFIG: GovernanceConfig = {
  votingDelaySeconds: 60 * 60,
  votingPeriodSeconds: 3 * 24 * 60 * 60,
  executionDelaySeconds: 24 * 60 * 60,
  quorumBps: 1000,
  approvalBps: 5000,
  proposalThreshold: 1000n,
  guardianThreshold: 2500n,
  emergencyCooldownSeconds: 24 * 60 * 60,
  maxActionsPerProposal: 12,
};

export const KIND_RISK: Record<ProposalKind, { quorumBps: number; approvalBps: number; requiresTimelock: boolean }> = {
  "risk-policy": { quorumBps: 1500, approvalBps: 6000, requiresTimelock: true },
  "ai-model": { quorumBps: 1200, approvalBps: 5500, requiresTimelock: true },
  "attestor-admission": { quorumBps: 1800, approvalBps: 6500, requiresTimelock: true },
  "attestor-policy": { quorumBps: 1500, approvalBps: 6000, requiresTimelock: true },
  "atc-fee-policy": { quorumBps: 2000, approvalBps: 6500, requiresTimelock: true },
  "treasury": { quorumBps: 2000, approvalBps: 6000, requiresTimelock: true },
  "protocol-config": { quorumBps: 1200, approvalBps: 5500, requiresTimelock: true },
  emergency: { quorumBps: 500, approvalBps: 7500, requiresTimelock: false },
  environment: { quorumBps: 1800, approvalBps: 6500, requiresTimelock: true },
  parameter: { quorumBps: 1000, approvalBps: 5500, requiresTimelock: true },
};
