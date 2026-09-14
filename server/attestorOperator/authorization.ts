import type { ElectionMode, OperatorOnChainState, OperatorPolicy, ReadinessCheck } from './types';

export function authorizationCheck(state: OperatorOnChainState, policy: OperatorPolicy): ReadinessCheck {
  if (policy.electionMode === 'OpenToAny') return { id: 'authorization', severity: 'info', ok: true, message: 'Authorization is not required because the chain is OpenToAny.', metadata: { mode: policy.electionMode } };
  if (policy.electionMode === 'DeniedToAll') return { id: 'authorization', severity: 'error', ok: false, message: 'Attestor election is disabled for this chain.', remediation: 'Wait for the network policy to permit new Attestors.', metadata: { mode: policy.electionMode } };
  return state.authorized
    ? { id: 'authorization', severity: 'info', ok: true, message: 'Attestor is present in the authorized on-chain set.', metadata: { mode: policy.electionMode } }
    : { id: 'authorization', severity: 'error', ok: false, message: 'Attestor is not authorized for this chain key.', remediation: 'Provide the Attestor SS58 address and chain key to the Creditcoin team for authorization.', metadata: { mode: policy.electionMode } };
}

export function canRegister(state: OperatorOnChainState, policy: OperatorPolicy): boolean {
  return (policy.electionMode === 'OpenToAny' || state.authorized) && !state.registered;
}

export function authorizationModeLabel(mode: ElectionMode): string { return mode === 'OpenToAny' ? 'Permissionless' : mode === 'AuthorizedOnly' ? 'Authorized operators only' : 'Registration disabled'; }