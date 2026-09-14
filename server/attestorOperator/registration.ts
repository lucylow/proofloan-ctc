import type { OperatorOnChainState, OperatorPolicy, OperatorActionPlan, ReadinessCheck } from './types';
import { authorizationCheck, canRegister } from './authorization';

export function registrationPlan(state: OperatorOnChainState, policy: OperatorPolicy, separateAccountsOk: boolean): OperatorActionPlan {
  const prerequisites: ReadinessCheck[] = [authorizationCheck(state, policy)];
  if (policy.requireSeparateStash) prerequisites.push({ id: 'account-separation', severity: separateAccountsOk ? 'info' : 'error', ok: separateAccountsOk, message: separateAccountsOk ? 'Attestor and stash accounts are separated.' : 'Attestor and stash accounts must be different.' });
  const allowed = canRegister(state, policy) && prerequisites.every(p => p.ok);
  return {
    action: 'register', allowed, risk: 'high', prerequisites,
    steps: allowed ? ['Use the stash account to submit registerAttestor(chainKey, attestorId).', 'Verify the on-chain entry transitions to Idle.', 'Start the Attestor daemon only after registration succeeds.'] : ['Resolve authorization and account-separation prerequisites before submitting registerAttestor.'],
    warnings: policy.electionMode === 'AuthorizedOnly' ? ['Registration will fail with NotPreAuthorizedToRegister when authorization is missing.'] : [],
  };
}

export function signalPlan(state: OperatorOnChainState, policy: OperatorPolicy): OperatorActionPlan {
  const ok = state.status === 'idle' && (policy.electionMode !== 'DeniedToAll');
  return { action: 'signal', allowed: ok, risk: 'medium', prerequisites: [{ id: 'idle', severity: ok ? 'info' : 'error', ok, message: ok ? 'Operator is Idle and may signal readiness.' : `Operator must be Idle before attest() can be submitted; current status is ${state.status}.` }], steps: ok ? ['Start the Attestor daemon.', 'Daemon submits attest() with its BLS public key and proof of possession.', 'Wait for the next election/epoch rotation.'] : ['Move the operator to Idle before signaling readiness.'], warnings: ['The daemon does not perform authorization or registration.'] };
}

export function chillPlan(state: OperatorOnChainState): OperatorActionPlan {
  const ok = state.status === 'active' || state.status === 'waiting';
  return { action: 'chill', allowed: ok, risk: 'medium', prerequisites: [{ id: 'running', severity: ok ? 'info' : 'warning', ok, message: ok ? 'Operator can schedule a clean stop.' : `Operator is ${state.status}; chill is unnecessary.` }], steps: ok ? ['Submit chill(chainKey, attestorId) with the stash account.', 'If Active, wait for the next epoch boundary to reach Idle.', 'Stop the Attestor daemon after Idle is confirmed.'] : ['No action required.'], warnings: state.status === 'active' ? ['Active Attestors move to Leaving before becoming Idle at the next epoch boundary.'] : [] };
}