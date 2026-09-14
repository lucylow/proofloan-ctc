import type { OperatorAction, OperatorActionPlan, OperatorAccount, OperatorConfigSource, OperatorHealthSnapshot, OperatorNodeConfig, OperatorOnChainState, OperatorPolicy, OperatorReadinessReport, ReadinessCheck, RpcEndpoint } from './types';
import { officialOperatorPolicy } from './policy';
import { OperatorReadinessEngine, type ReadinessInput } from './readiness';
import { OperatorStateMachine } from './stateMachine';
import { OperatorRpcManager } from './rpc';
import { OperatorMetrics } from './metrics';
import { authorizationCheck } from './authorization';
import { registrationPlan, signalPlan, chillPlan } from './registration';
import { AccountSeparation } from './accounts';
import { OperatorError, normalizeOperatorError, parseAtomicBalance } from './errors';

export class AttestorOperatorService {
  readonly readiness = new OperatorReadinessEngine();
  readonly stateMachine = new OperatorStateMachine();
  readonly rpc: OperatorRpcManager;
  readonly metrics = new OperatorMetrics();

  constructor(readonly operator: { operatorId: string; environment: 'cc3-testnet'|'cc3-mainnet'; chainKey: number; node: Partial<OperatorNodeConfig>; attestor: OperatorAccount; stash: OperatorAccount; state: OperatorOnChainState }, endpoints: RpcEndpoint[] = []) { this.rpc = new OperatorRpcManager(endpoints); }

  policy(): OperatorPolicy {
    const p = officialOperatorPolicy(this.operator.environment);
    if (!Number.isInteger(this.operator.chainKey) || this.operator.chainKey <= 0 || p.chainKey !== this.operator.chainKey) {
      throw new OperatorError("POLICY", `Unsupported chain key ${this.operator.chainKey} for ${this.operator.environment}.`);
    }
    return p;
  }
  readinessReport(input: Omit<ReadinessInput,'policy'>): OperatorReadinessReport { return this.readiness.evaluate({ ...input, policy:this.policy() }); }
  actionPlan(action: OperatorAction, readiness: OperatorReadinessReport): OperatorActionPlan {
    const policy = this.policy();
    const baseState = this.operator.state;
    if (action === 'register') return registrationPlan(baseState, policy, new AccountSeparation().validate(this.operator.attestor,this.operator.stash).length===0);
    if (action === 'signal') return signalPlan(baseState, policy);
    if (action === 'chill') return chillPlan(baseState);
    if (action === 'authorize') return this.authorizationPlan(policy);
    if (action === 'unregister') return this.adminPlan('unregister', baseState.status === 'idle', 'Unregister only after the Attestor is Idle.');
    if (action === 'withdraw-unbonded') return this.adminPlan('withdraw-unbonded', baseState.status === 'unregistered', 'Withdraw only after unregistering and satisfying the unbonding conditions.');
    if (action === 'restart') return this.adminPlan('restart', readiness.readiness !== 'blocked', 'Restart only after preserving the current key material and state.');
    if (action === 'rotate-rpc') return this.adminPlan('rotate-rpc', this.rpc.list().length >= 1, 'Rotate endpoints without changing on-chain identity.');
    return this.adminPlan('rotate-secret', false, 'Secret rotation requires an on-chain identity migration plan; never overwrite a running identity in-place.');
  }
  evaluateCurrent(): OperatorReadinessReport {
    try {
      const attestorBalance = parseAtomicBalance(this.operator.attestor.fundedBalanceAtomic);
      const stashBalance = parseAtomicBalance(this.operator.stash.fundedBalanceAtomic);
      const extra: ReadinessCheck[] = [];
      if (!attestorBalance.ok) {
        extra.push({
          id: "attestor-balance-parse",
          severity: "error",
          ok: false,
          message: attestorBalance.message,
          remediation: "Set ATTESTOR_BALANCE_ATOMIC to a non-negative integer string.",
        });
      }
      if (!stashBalance.ok) {
        extra.push({
          id: "stash-balance-parse",
          severity: "error",
          ok: false,
          message: stashBalance.message,
          remediation: "Set ATTESTOR_STASH_BALANCE_ATOMIC to a non-negative integer string.",
        });
      }
      if (extra.length > 0) {
        return {
          operatorId: this.operator.operatorId,
          environment: this.operator.environment,
          chainKey: Number.isInteger(this.operator.chainKey) ? this.operator.chainKey : 0,
          readiness: "blocked",
          scoreBps: 0,
          checks: extra,
          generatedAt: new Date().toISOString(),
        };
      }
      return this.readinessReport({
        state: this.operator.state,
        node: this.operator.node,
        attestor: this.operator.attestor,
        stash: this.operator.stash,
        rpcs: this.rpc.list(),
        publicPortOpen: Boolean(this.operator.node.publicAddress) && process.env.ATTESTOR_P2P_REACHABLE === "true",
        bootNodeConfigured: (this.operator.node.bootNodes?.length ?? 0) > 0,
        currentBalanceAtomic: attestorBalance.value,
        stashBalanceAtomic: stashBalance.value,
      });
    } catch (error) {
      const normalized = normalizeOperatorError(error);
      return {
        operatorId: this.operator.operatorId,
        environment: this.operator.environment,
        chainKey: Number.isInteger(this.operator.chainKey) ? this.operator.chainKey : 0,
        readiness: "blocked",
        scoreBps: 0,
        checks: [{
          id: "operator-error",
          severity: "error",
          ok: false,
          message: normalized.message,
          remediation: "Fix operator configuration before planning on-chain actions.",
        }],
        generatedAt: new Date().toISOString(),
      };
    }
  }
  health(input: { processHealthy:boolean; p2pReachable:boolean; attestationLagBlocks:number; epochSecondsRemaining?:number; lastAttestationAt?:string; rpcRttMs?:number }): OperatorHealthSnapshot {
    try {
      const cc3 = this.rpc.tryChoose('cc3');
      const eth = this.rpc.tryChoose('ethereum');
      const lag = Number.isFinite(input.attestationLagBlocks) ? Math.max(0, Math.trunc(input.attestationLagBlocks)) : 0;
      return {
        operatorId: this.operator.operatorId,
        environment: this.operator.environment,
        chainKey: this.operator.chainKey,
        readiness: this.operator.state.active ? 'ready' : 'degraded',
        processHealthy: input.processHealthy,
        cc3Healthy: cc3 != null && cc3.healthy !== false,
        ethereumHealthy: eth != null && eth.healthy !== false,
        p2pReachable: input.p2pReachable,
        onChainStatus: this.operator.state.status,
        epochSecondsRemaining: input.epochSecondsRemaining,
        attestationLagBlocks: lag,
        lastAttestationAt: input.lastAttestationAt,
        metricsPort: this.operator.node.apiPort ?? 9100,
        collectedAt: new Date().toISOString(),
      };
    } catch (error) {
      const normalized = normalizeOperatorError(error);
      return {
        operatorId: this.operator.operatorId,
        environment: this.operator.environment,
        chainKey: Number.isInteger(this.operator.chainKey) ? this.operator.chainKey : 0,
        readiness: 'degraded',
        processHealthy: false,
        cc3Healthy: false,
        ethereumHealthy: false,
        p2pReachable: false,
        onChainStatus: this.operator.state.status,
        attestationLagBlocks: 0,
        lastAttestationAt: input.lastAttestationAt,
        metricsPort: this.operator.node.apiPort ?? 9100,
        collectedAt: new Date().toISOString(),
        error: normalized.message,
      };
    }
  }
  lifecycle(to: OperatorOnChainState['status'], reason: string, epoch?: number) { const event = this.stateMachine.transition({operatorId:this.operator.operatorId,from:this.operator.state.status,to,reason,epoch}); this.operator.state={...this.operator.state,status:to}; this.metrics.increment(`lifecycle.${to}`); return event; }
  configSources(): OperatorConfigSource[] { return ['file','env','cli','merged']; }
  private authorizationPlan(policy: OperatorPolicy): OperatorActionPlan { const c=authorizationCheck(this.operator.state,policy); return { action:'authorize', allowed:policy.electionMode==='AuthorizedOnly'&&!this.operator.state.authorized, risk:'high', prerequisites:[c], steps:['Provide the Attestor SS58 address to the Creditcoin team.','Provide the exact chain key.','Confirm attestation.authorizedAttestors(chainKey, address) becomes populated.'], warnings:policy.electionMode==='AuthorizedOnly'?[]:['Authorization is unnecessary on OpenToAny networks.'] }; }
  private adminPlan(action:OperatorAction, allowed:boolean, reason:string):OperatorActionPlan { return { action, allowed, risk:action==='restart'||action==='rotate-rpc'?'medium':'high', prerequisites:[{id:`${action}-precondition`,severity:allowed?'info':'error',ok:allowed,message:allowed?'Preconditions satisfied.':reason}], steps:allowed?[reason]:[reason], warnings:[] }; }
}