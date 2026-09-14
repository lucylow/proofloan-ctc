export type WorkerPhase =
  | "created" | "discovered" | "matured" | "proof-building" | "proof-ready"
  | "submitting" | "submitted" | "confirmed" | "dead-letter" | "cancelled";

export type RetryClass = "transient" | "rate-limit" | "attestation" | "reorg" | "permanent" | "unknown";

export type SourceLog = {
  chainId: string;
  chainKey?: number;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  contractAddress: string;
  eventName: string;
  topics: string[];
  data: string;
  observedAt: string;
};

export type IndexedEvent = SourceLog & {
  eventId: string;
  confirmations: number;
  sourceCheckpoint: string;
};

export type WorkerJob = {
  jobId: string;
  queryId: string;
  eventId: string;
  attempts: number;
  phase: WorkerPhase;
  createdAt: string;
  updatedAt: string;
  nextAttemptAt: string;
  lastError?: string;
  leaseOwner?: string;
  leaseExpiresAt?: string;
};

export type WorkerConfig = {
  workerId: string;
  environment: "cc3-testnet" | "cc3-mainnet";
  pollIntervalMs: number;
  batchSize: number;
  maxAttempts: number;
  leaseMs: number;
  shutdownGraceMs: number;
  reorgBuffer: number;
  minConfirmations: number;
  proofTimeoutMs: number;
  submissionTimeoutMs: number;
  attestationTimeoutMs: number;
  maxLogRange: number;
  rpcQuorum: number;
  maxConcurrentJobs: number;
  gasAware?: boolean;
};

export type WorkerClock = { now(): number };
export const systemClock: WorkerClock = { now: () => Date.now() };

export type Logger = {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

export type EventCursor = {
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
};

export type RpcSource = {
  name: string;
  getLatestBlock(): Promise<number>;
  getBlockHash(blockNumber: number): Promise<string>;
  getLogs(input: { fromBlock: number; toBlock: number; address: string; eventName: string }): Promise<SourceLog[]>;
  getTransactionReceipt(txHash: string): Promise<{ status: number; blockNumber: number } | null>;
};

export type AttestationSource = {
  waitForAttestation(chainKey: number, blockNumber: number, timeoutMs: number): Promise<{
    chainKey: number;
    sourceBlock: number;
    sourceBlockHash: string;
    attestedAt: string;
    validUntil: string;
  }>;
};

export type ProofSource = {
  build(input: { chainKey: number; blockNumber: number; transactionHash: string; event: SourceLog }): Promise<unknown>;
};

export type AscSource = {
  submit(input: { queryId: string; event: SourceLog; proof: unknown; idempotencyKey: string }): Promise<{ transactionHash: string }>;
  getReceipt(txHash: string): Promise<{ status: number; blockNumber: number } | null>;
};

export type WorkerMetricsSnapshot = {
  discovered: number;
  deduplicated: number;
  matured: number;
  proofBuilt: number;
  submissions: number;
  confirmations: number;
  failures: number;
  retries: number;
  deadLetters: number;
  activeJobs: number;
  queueDepth: number;
  lagBlocks: number;
};
