import type { OperatorReadinessReport, OperatorPolicy, OperatorOnChainState, OperatorNodeConfig } from './types';

export function renderOperatorSummary(input: { policy:OperatorPolicy; state:OperatorOnChainState; config:Partial<OperatorNodeConfig>; readiness:OperatorReadinessReport }): string {
  const r=input.readiness;
  const lines=[
    `ProofLoan Attestor Operator`,
    `Environment: ${input.policy.environment}`,
    `Chain key: ${input.policy.chainKey}`,
    `Election mode: ${input.policy.electionMode}`,
    `Operator: ${input.state.operatorId}`,
    `Status: ${input.state.status}`,
    `Readiness: ${r.readiness} (${r.scoreBps/100}%)`,
    `CC3 RPC: ${input.config.cc3?.url ? 'configured':'missing'}`,
    `Ethereum RPC: ${input.config.eth?.url ? 'configured':'missing'}`,
    `P2P: ${input.config.p2pPort ?? input.policy.p2pPort}`,
    `Checks: ${r.checks.filter(c=>c.ok).length}/${r.checks.length} passed`,
  ];
  return lines.join('\n');
}