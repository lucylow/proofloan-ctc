export type ProofPhase = "query" | "generation" | "verification" | "extraction";
export type ProofStatus =
  | "queued"
  | "awaiting_attestation"
  | "building"
  | "ready"
  | "submitted"
  | "verified"
  | "rejected"
  | "failed";
export type ProofRisk = "low" | "medium" | "high" | "blocked";
export type ProofAdapterKind = "preview" | "live";

export interface TransactionTarget {
  chainKey: number;
  txHash: string;
  sourceAddress?: string;
  contractAddress?: string;
  eventSignature?: string;
}

export interface SourceBlock {
  number: bigint;
  hash: string;
  parentHash: string;
  timestamp?: number;
  transactionCount: number;
  attested: boolean;
}

export interface MerkleEntry {
  hash: string;
  position: "left" | "right";
}

export interface MerkleProof {
  root: string;
  siblings: MerkleEntry[];
}

export interface ContinuityProof {
  lowerEndpointDigest: string;
  roots: string[];
  startBlock: bigint;
  endBlock: bigint;
  hashCount: number;
}

export interface EncodedTransaction {
  hex: string;
  byteLength: number;
  txIndex: number;
  blockNumber: bigint;
  txHash: string;
}

export interface ProofEnvelope {
  requestId: string;
  target: TransactionTarget;
  transaction: EncodedTransaction;
  merkleProof: MerkleProof;
  continuityProof: ContinuityProof;
  generatedAt: number;
  attestationBlock: bigint;
  proofBuilderVersion: string;
  fingerprint: string;
}

export interface ExtractionResult {
  status: 0 | 1;
  txType: number;
  from?: string;
  to?: string;
  value?: string;
  logs: Array<{ address: string; topics: string[]; data: string }>;
}

export interface ProofDecision {
  allowed: boolean;
  risk: ProofRisk;
  reasonCodes: string[];
  estimatedGasCtc?: number;
  continuityHashCount: number;
  transactionBytes: number;
}

export interface ProvingRequest {
  requestId: string;
  target: TransactionTarget;
  requestedAt: number;
  maxTransactionBytes: number;
  maxContinuityHashes: number;
  freshnessWindowBlocks: number;
  deadlineMs: number;
}

export interface VerificationReport {
  merkleValid: boolean;
  continuityValid: boolean;
  transactionSizeValid: boolean;
  ok: boolean;
  adapter: ProofAdapterKind;
  educational: boolean;
  blockProver?: string;
}

export interface PipelineResult {
  phase: ProofPhase;
  request: ProvingRequest;
  envelope: ProofEnvelope;
  verification: VerificationReport;
  extraction: ExtractionResult;
  decision: ProofDecision;
  adapter: ProofAdapterKind;
  educational: boolean;
}
