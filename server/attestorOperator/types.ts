export type OperatorEnvironment = 'cc3-testnet' | 'cc3-mainnet';
export type OperatorStatus = 'unregistered' | 'idle' | 'waiting' | 'active' | 'leaving' | 'inactive';
export type ElectionMode = 'OpenToAny' | 'AuthorizedOnly' | 'DeniedToAll';
export type RpcRole = 'cc3' | 'ethereum';
export type RpcScheme = 'ws' | 'wss';
export type OperatorReadiness = 'ready' | 'blocked' | 'degraded' | 'unknown';
export type ReadinessSeverity = 'info' | 'warning' | 'error';
export type OperatorAction =
  | 'authorize'
  | 'register'
  | 'signal'
  | 'chill'
  | 'unregister'
  | 'withdraw-unbonded'
  | 'restart'
  | 'rotate-rpc'
  | 'rotate-secret';

export type OperatorAccount = {
  address: string;
  role: 'attestor' | 'stash';
  keyType: 'sr25519';
  secretConfigured: boolean;
  fundedBalanceAtomic?: string;
  minimumBalanceAtomic?: string;
  custody: 'hot' | 'cold' | 'warm';
};

export type RpcEndpoint = {
  role: RpcRole;
  url: string;
  scheme: RpcScheme;
  selfHosted: boolean;
  healthy?: boolean;
  latencyMs?: number;
  supportsHistoricalBlocks: boolean;
  maxConcurrency: number;
  lastCheckedAt?: string;
  error?: string;
};

export type OperatorPolicy = {
  environment: OperatorEnvironment;
  chainKey: number;
  electionMode: ElectionMode;
  minAttestorBalanceAtomic: string;
  recommendedAttestorBalanceAtomic: string;
  minBondAtomic: string;
  requireAuthorizationInAuthorizedOnly: boolean;
  requireSeparateStash: boolean;
  requireP2PInbound: boolean;
  requireStablePublicAddress: boolean;
  requireHistoricalEthereumRpc: boolean;
  epochSeconds: number;
  p2pPort: number;
  apiPort: number;
  normalEthRequestsPerDay: number;
  maxEthConcurrentRequests: number;
};

export type OperatorNodeConfig = {
  name: string;
  chainKey: number;
  secret: string;
  publicAddress?: string;
  logsPath: string;
  apiPort: number;
  p2pPort: number;
  noMdns: boolean;
  bootNodes: string[];
  eth: { url: string };
  cc3: { url: string };
};

export type OperatorOnChainState = {
  operatorId: string;
  environment: OperatorEnvironment;
  chainKey: number;
  attestorAddress: string;
  stashAddress: string;
  authorized: boolean;
  registered: boolean;
  status: OperatorStatus;
  elected: boolean;
  active: boolean;
  lastSeenAt?: string;
  currentEpoch?: number;
  secondsToEpochEnd?: number;
};

export type ReadinessCheck = {
  id: string;
  severity: ReadinessSeverity;
  ok: boolean;
  message: string;
  remediation?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type OperatorReadinessReport = {
  operatorId: string;
  environment: OperatorEnvironment;
  chainKey: number;
  readiness: OperatorReadiness;
  scoreBps: number;
  checks: ReadinessCheck[];
  generatedAt: string;
};

export type OperatorHealthSnapshot = {
  operatorId: string;
  environment: OperatorEnvironment;
  chainKey: number;
  readiness: OperatorReadiness;
  processHealthy: boolean;
  cc3Healthy: boolean;
  ethereumHealthy: boolean;
  p2pReachable: boolean;
  onChainStatus: OperatorStatus;
  epochSecondsRemaining?: number;
  attestationLagBlocks: number;
  lastAttestationAt?: string;
  metricsPort: number;
  collectedAt: string;
  error?: string;
};

export type OperatorLifecycleEvent = {
  operatorId: string;
  from: OperatorStatus;
  to: OperatorStatus;
  reason: string;
  at: string;
  epoch?: number;
};

export type OperatorActionPlan = {
  action: OperatorAction;
  allowed: boolean;
  risk: 'low' | 'medium' | 'high';
  prerequisites: ReadinessCheck[];
  steps: string[];
  warnings: string[];
};

export type OperatorConfigSource = 'file' | 'env' | 'cli' | 'merged';