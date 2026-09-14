export const attestorEnvironments = ["cc3-testnet", "cc3-mainnet"] as const;
export type AttestorEnvironment = (typeof attestorEnvironments)[number];

export const attestorStatuses = ["active", "probation", "jailed", "inactive"] as const;
export type AttestorStatus = (typeof attestorStatuses)[number];

export const attestorSignatureAlgorithms = ["ecdsa", "bls"] as const;
export type AttestorSignatureAlgorithm = (typeof attestorSignatureAlgorithms)[number];

export const attestorFaultCategories = [
  "double-sign",
  "equivocation",
  "invalid-observation",
  "unavailable",
  "stale-certificate",
  "replay",
  "malformed-signature",
] as const;
export type AttestorFaultCategory = (typeof attestorFaultCategories)[number];

export const attestorFaultSeverities = ["info", "warning", "critical"] as const;
export type AttestorFaultSeverity = (typeof attestorFaultSeverities)[number];

export const attestorRewardActivities = ["proof-verification", "message-carry", "both"] as const;
export type AttestorRewardActivity = (typeof attestorRewardActivities)[number];

export const attestorRewardStatuses = ["accrued", "claimable", "claimed", "slashed"] as const;
export type AttestorRewardStatus = (typeof attestorRewardStatuses)[number];

export const attestorEventTypes = [
  "attestation.aggregated",
  "continuity.verified",
  "message.signed",
  "delivery.carried",
  "reward.accrued",
  "fault.detected",
  "slash.confirmed",
] as const;
export type AttestorEventType = (typeof attestorEventTypes)[number];

export type AttestorIdentity = {
  operatorId: string;
  payoutAddress: string;
  signingAddress: string;
  blsPublicKey: string;
  environment: AttestorEnvironment;
  chains: string[];
};

export type AttestorProfile = AttestorIdentity & {
  status: AttestorStatus;
  stakeAtomic: string;
  minStakeAtomic: string;
  weightBps: number;
  joinedAt: string;
  lastSeenAt: string;
  uptimeBps: number;
  faultCount: number;
  slashCount: number;
  rewardAtomic: string;
};

export type AttestorObservation = {
  observationId: string;
  operatorId: string;
  sourceChain: string;
  sourceBlock: number;
  blockHash: string;
  previousBlockHash: string;
  observedAt: string;
  maturityAt: string;
  finalized: boolean;
};

export type AttestorSignature = {
  operatorId: string;
  algorithm: AttestorSignatureAlgorithm;
  publicKey: string;
  signature: string;
  signedDigest: string;
  signedAt: string;
};

export type AttestorQuorum = {
  requiredBps: number;
  observedWeightBps: number;
  signerCount: number;
  totalEligibleWeightBps: number;
  supermajority: boolean;
};

export type AttestationCertificate = {
  certificateId: string;
  environment: AttestorEnvironment;
  sourceChain: string;
  sourceBlock: number;
  blockHash: string;
  previousCheckpointHash?: string;
  digest: string;
  signatures: AttestorSignature[];
  aggregateSignature: string;
  quorum: AttestorQuorum;
  createdAt: string;
  continuityDepth: number;
};

export type ContinuityProof = {
  startBlock: number;
  endBlock: number;
  blockHashes: string[];
  attestationDigest: string;
  verified: boolean;
};

export type MerkleProofEnvelope = {
  sourceBlock: number;
  txHash: string;
  merkleProof: unknown[];
  continuityProof: ContinuityProof;
};

export type VerifiedCrossChainFact = {
  factId: string;
  sourceChain: string;
  sourceBlock: number;
  txHash: string;
  eventType: "TRANSACTION";
  verified: boolean;
  attestationCertificateId: string;
  quorum: AttestorQuorum;
  proofRoot: string;
  attestorCount: number;
  verifiedAt: string;
};

export type CrossChainMessage = {
  messageId: string;
  originChain: string;
  destinationChain: string;
  emitter: string;
  payloadHex: string;
  acknowledgementRequired: boolean;
  nonce: string;
  createdAt: string;
};

export type MessageAttestation = {
  message: CrossChainMessage;
  digest: string;
  signatures: AttestorSignature[];
  aggregateSignature?: string;
  quorum: AttestorQuorum;
};

export type AttestorFault = {
  faultId: string;
  operatorId: string;
  sourceChain: string;
  category: AttestorFaultCategory;
  severity: AttestorFaultSeverity;
  evidenceDigest: string;
  detectedAt: string;
  confirmedAt?: string;
  slashBps?: number;
};

export type AttestorRewardAllocation = {
  operatorId: string;
  activity: AttestorRewardActivity;
  amountAtomic: string;
  status: AttestorRewardStatus;
  feeId: string;
};

export type AttestorHealth = {
  operatorId: string;
  status: AttestorStatus;
  available: boolean;
  latencyMs: number;
  uptimeBps: number;
  stakeAtomic: string;
  weightBps: number;
  faults24h: number;
  lastSeenAt: string;
};

export type AttestorServiceSnapshot = {
  environment: AttestorEnvironment;
  eligibleAttestors: number;
  activeAttestors: number;
  totalStakeAtomic: string;
  totalWeightBps: number;
  requiredQuorumBps: number;
  healthyAttestors: number;
  pendingFaults: number;
  pendingRewardsAtomic: string;
  latestAttestationByChain: Record<string, number>;
};

export type AttestorActivity = {
  type: AttestorEventType;
  at: string;
  digest?: string;
  metadata?: Record<string, unknown>;
};

export function isAttestorEnvironment(value: string): value is AttestorEnvironment {
  return (attestorEnvironments as readonly string[]).includes(value);
}

export function isAttestorStatus(value: string): value is AttestorStatus {
  return (attestorStatuses as readonly string[]).includes(value);
}
