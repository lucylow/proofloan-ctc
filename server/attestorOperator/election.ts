import type { ElectionMode, OperatorOnChainState, OperatorPolicy, ReadinessCheck } from './types';

export type ElectionAssessment = {
  selectable: boolean;
  reason: string;
  checks: ReadinessCheck[];
  nextEpochRequired: boolean;
};

export function assessElection(state: OperatorOnChainState, policy: OperatorPolicy): ElectionAssessment {
  const checks: ReadinessCheck[] = [];
  const modeOk = policy.electionMode !== 'DeniedToAll';
  checks.push({ id:'election-mode', severity:modeOk?'info':'error', ok:modeOk, message:modeOk?`Election mode is ${policy.electionMode}.`:'No Attestors may be selected under DeniedToAll.' });
  const authOk = policy.electionMode !== 'AuthorizedOnly' || state.authorized;
  checks.push({ id:'election-authorization', severity:authOk?'info':'error', ok:authOk, message:authOk?'Operator meets the network authorization requirement.':'Operator is not in the authorized set.' });
  const statusOk = state.status === 'waiting' || state.status === 'active';
  checks.push({ id:'election-status', severity:statusOk?'info':'warning', ok:statusOk, message:statusOk?`Operator status ${state.status} is election-compatible.`:`Operator status ${state.status} is not election-ready.` });
  const selectable = modeOk && authOk && statusOk;
  return { selectable, reason: selectable ? 'Operator satisfies the modeled election prerequisites.' : checks.filter(x=>!x.ok).map(x=>x.message).join(' '), checks, nextEpochRequired: state.status === 'waiting' };
}

export function modeDescription(mode: ElectionMode): string {
  return mode === 'OpenToAny' ? 'Any Attestor may be selected.' : mode === 'AuthorizedOnly' ? 'Only authorized Attestors may be selected.' : 'No new Attestors may be selected.';
}