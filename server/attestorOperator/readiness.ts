import type { OperatorAccount, OperatorNodeConfig, OperatorOnChainState, OperatorPolicy, OperatorReadiness, OperatorReadinessReport, ReadinessCheck, RpcEndpoint } from './types';
import { minimumBalanceMet, bondRequirementMet, recommendedBalanceMet } from './policy';
import { authorizationCheck } from './authorization';
import { AccountSeparation } from './accounts';

export type ReadinessInput = {
  state: OperatorOnChainState;
  policy: OperatorPolicy;
  node: Partial<OperatorNodeConfig>;
  attestor: OperatorAccount;
  stash: OperatorAccount;
  rpcs: RpcEndpoint[];
  publicPortOpen: boolean;
  bootNodeConfigured: boolean;
  currentBalanceAtomic: bigint;
  stashBalanceAtomic: bigint;
};

export class OperatorReadinessEngine {
  evaluate(input: ReadinessInput): OperatorReadinessReport {
    const checks = [
      authorizationCheck(input.state, input.policy),
      this.chainKey(input),
      this.secret(input),
      this.accountSeparation(input),
      this.attestorBalance(input),
      this.stashBalance(input),
      this.rpc(input, 'cc3'),
      this.rpc(input, 'ethereum'),
      this.p2p(input),
      this.bootNode(input),
      this.status(input),
    ];
    const errors = checks.filter(c => !c.ok && c.severity === 'error').length;
    const warnings = checks.filter(c => !c.ok && c.severity === 'warning').length;
    const scoreBps = Math.max(0, Math.round((checks.filter(c => c.ok).length / checks.length) * 10000));
    const readiness: OperatorReadiness = errors > 0 ? 'blocked' : warnings > 0 ? 'degraded' : 'ready';
    return { operatorId: input.state.operatorId, environment: input.state.environment, chainKey: input.state.chainKey, readiness, scoreBps, checks, generatedAt: new Date().toISOString() };
  }

  private chainKey(input: ReadinessInput): ReadinessCheck { const ok = input.state.chainKey === input.policy.chainKey; return { id:'chain-key', severity: ok ? 'info':'error', ok, message: ok ? `Chain key ${input.state.chainKey} matches policy.` : `Configured chain key ${input.state.chainKey} does not match expected ${input.policy.chainKey}.`, remediation: 'Verify the Attestcoin per-chain settings for the target CC3 environment.' }; }
  private secret(input: ReadinessInput): ReadinessCheck { const ok = input.attestor.secretConfigured; return { id:'secret', severity: ok ? 'info':'error', ok, message: ok ? 'Attestor secret is configured.' : 'Attestor secret is missing.', remediation: 'Set ATTESTOR_SECRET or the equivalent CLI/config value. Never run a production Attestor with a random key.' }; }
  private accountSeparation(input: ReadinessInput): ReadinessCheck { const errors = new AccountSeparation().validate(input.attestor, input.stash); const ok = errors.length === 0; return { id:'account-separation', severity: ok ? 'info':'error', ok, message: ok ? 'Hot Attestor and cold Stash separation is valid.' : errors.join(' '), remediation: 'Use distinct accounts and keep stash custody away from the Attestor host.' }; }
  private attestorBalance(input: ReadinessInput): ReadinessCheck { const ok = minimumBalanceMet(input.currentBalanceAtomic, input.policy); const recommended = recommendedBalanceMet(input.currentBalanceAtomic, input.policy); return { id:'attestor-balance', severity: ok ? (recommended ? 'info':'warning') : 'error', ok, message: ok ? (recommended ? 'Attestor balance is above the recommended buffer.' : 'Attestor balance clears the hard startup floor but is below the recommended buffer.') : 'Attestor free balance is below the hard startup floor.', remediation: 'Fund the Attestor account. A small operational reserve helps absorb occasional non-refunded fees.', metadata: { balanceAtomic: input.currentBalanceAtomic.toString() } }; }
  private stashBalance(input: ReadinessInput): ReadinessCheck { const ok = bondRequirementMet(input.stashBalanceAtomic, input.policy); return { id:'stash-balance', severity: ok ? 'info':'error', ok, message: ok ? 'Stash balance satisfies the configured bond/registration floor.' : 'Stash balance is below the minimum bond requirement.', remediation: 'Fund the Stash account before registering the Attestor.', metadata: { balanceAtomic: input.stashBalanceAtomic.toString(), minBondAtomic: input.policy.minBondAtomic } }; }
  private rpc(input: ReadinessInput, role: 'cc3'|'ethereum'): ReadinessCheck { const found = input.rpcs.find(r => r.role === role); const ok = !!found && (found.healthy !== false) && (role !== 'ethereum' || found.supportsHistoricalBlocks); return { id:`rpc-${role}`, severity: ok ? 'info':'error', ok, message: ok ? `${role.toUpperCase()} WebSocket endpoint is configured and suitable.` : `No healthy ${role.toUpperCase()} endpoint with the required capabilities is available.`, remediation: role === 'ethereum' ? 'Use a WSS/WS Ethereum endpoint with sufficient historical block access.' : 'Use a healthy CC3 WebSocket endpoint.' }; }
  private p2p(input: ReadinessInput): ReadinessCheck { const ok = !input.policy.requireP2PInbound || input.publicPortOpen; return { id:'p2p', severity: ok ? 'info':'error', ok, message: ok ? `P2P port ${input.policy.p2pPort} is reachable.` : `P2P port ${input.policy.p2pPort} is not reachable from the Internet.`, remediation: 'Open inbound TCP/transport access and configure a stable public address when behind NAT.' }; }
  private bootNode(input: ReadinessInput): ReadinessCheck { const ok = input.bootNodeConfigured; return { id:'boot-node', severity: ok ? 'info':'warning', ok, message: ok ? 'Attestor boot-node discovery is configured.' : 'No Attestor boot node is configured.', remediation: 'Request the current boot-node multiaddress from the Creditcoin team for the target CC3 environment.' }; }
  private status(input: ReadinessInput): ReadinessCheck { const ok = input.state.status === 'active' || input.state.status === 'waiting' || input.state.status === 'idle'; const severity = ok ? 'info':'warning'; return { id:'on-chain-status', severity, ok, message: `Current on-chain lifecycle status is ${input.state.status}.`, remediation: input.state.status === 'unregistered' ? 'Complete authorization and registerAttestor first.' : undefined }; }
}