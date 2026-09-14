import type { ProofBundle, ReadabilityEnvironment, ReadabilityQuery, SourceEvent } from "@shared/readability";
import type { AttestationSnapshot } from "./attestation";

export type ReadabilityStatus =
  | "created"
  | "watching"
  | "awaiting-attestation"
  | "proof-building"
  | "proof-ready"
  | "submitted"
  | "verified"
  | "delivered"
  | "rejected"
  | "expired"
  | "failed";

export type EventCursor = {
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
};

export type SourceChainAdapter = {
  chainId: string;
  getLatestBlock(): Promise<number>;
  getBlockHash(blockNumber: number): Promise<string>;
  getLogs(args: {
    fromBlock: number;
    toBlock: number;
    address: string;
    eventName: string;
  }): Promise<SourceEvent[]>;
  getTransactionReceipt(txHash: string): Promise<{ status: number; blockNumber: number } | null>;
};

export type ProofBuilder = {
  kind: "preview" | "live";
  build(query: ReadabilityQuery, event: SourceEvent): Promise<ProofBundle>;
};

export type BlockProver = {
  kind: "preview" | "live";
  address: string;
  verify(bundle: ProofBundle): Promise<boolean>;
};

export type AscExecutor = {
  submit(
    query: ReadabilityQuery,
    event: SourceEvent,
    bundle: ProofBundle,
  ): Promise<{ transactionHash: string; receiptStatus: 1 }>;
};

export type AttestationProvider = {
  kind: "preview" | "live";
  waitForAttestation(input: {
    chainKey: number;
    blockNumber: number;
    blockHash: string;
    timeoutMs: number;
  }): Promise<AttestationSnapshot>;
};

export type ReadabilityStore = {
  putQuery(query: ReadabilityQuery & { queryId: string }): Promise<void>;
  getQuery(queryId: string): Promise<(ReadabilityQuery & { queryId: string }) | null>;
  putStatus(queryId: string, status: ReadabilityStatus): Promise<void>;
  getStatus(queryId: string): Promise<ReadabilityStatus | null>;
  putEvent(queryId: string, event: SourceEvent): Promise<void>;
  putProof(queryId: string, proof: ProofBundle): Promise<void>;
  hasProcessedEvent(eventKey: string): Promise<boolean>;
  markProcessedEvent(eventKey: string): Promise<void>;
};

export type ReadabilityConfig = {
  environment: ReadabilityEnvironment;
  pollIntervalMs: number;
  maxBatchSize: number;
  reorgBufferBlocks: number;
  attestationTimeoutMs: number;
  proofTimeoutMs: number;
  deliveryTimeoutMs: number;
  maxRetries: number;
  /** Opt-in worker rejection/deferral. Default false keeps preview delivery unchanged. */
  gasAware: boolean;
};

export type ReadabilityRuntime = {
  query: ReadabilityQuery & { queryId: string };
  status: ReadabilityStatus;
  cursor?: EventCursor;
  event?: SourceEvent;
  proof?: ProofBundle;
  attempts: number;
};

export type StatusJournalEntry = {
  queryId: string;
  status: ReadabilityStatus;
  at: string;
};
