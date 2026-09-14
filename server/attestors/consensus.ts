import type { AttestationCertificate, AttestorObservation, AttestorSignature, AttestorProfile } from "@shared/attestors";
import { randomUUID } from "node:crypto";
import { digestAttestationInput, sha256Hex } from "./hash";
import { assertSupermajority, calculateQuorum, DEFAULT_SUPERMAJORITY_BPS } from "./quorum";
import { finalizeObservation, isMature } from "./maturity";

export type ConsensusInput = {
  environment: "cc3-testnet" | "cc3-mainnet";
  sourceChain: string;
  observations: AttestorObservation[];
  signatures: AttestorSignature[];
  eligible: AttestorProfile[];
  previousCheckpointHash?: string;
  requiredQuorumBps?: number;
  maturityPolicy?: Parameters<typeof isMature>[3];
};

export function buildAttestationCertificate(input: ConsensusInput, now = new Date()): AttestationCertificate {
  if (input.observations.length === 0) throw new Error("Attestation requires observations.");
  const finalized = input.observations.map(item => finalizeObservation(item, now)).filter(item => item.finalized);
  if (finalized.length === 0) throw new Error("No observation has reached source-chain maturity.");
  const canonicalBlock = [...finalized].sort((a, b) => b.sourceBlock - a.sourceBlock)[0];
  const matching = finalized.filter(item => item.sourceBlock === canonicalBlock.sourceBlock && item.blockHash === canonicalBlock.blockHash);
  const digest = digestAttestationInput({
    environment: input.environment,
    sourceChain: input.sourceChain,
    sourceBlock: canonicalBlock.sourceBlock,
    blockHash: canonicalBlock.blockHash,
    previousCheckpointHash: input.previousCheckpointHash,
  });
  const signatures = input.signatures.filter(sig => sig.signedDigest === digest);
  const quorum = calculateQuorum(input.eligible, signatures, input.requiredQuorumBps ?? DEFAULT_SUPERMAJORITY_BPS);
  assertSupermajority(quorum);
  if (matching.length === 0) throw new Error("No matured observations agree on the canonical block.");
  const uniqueBlocks = new Set(finalized.filter(item => item.sourceBlock === canonicalBlock.sourceBlock).map(item => item.blockHash));
  if (uniqueBlocks.size > 1) throw new Error("Attestor observations disagree on the same source block.");
  return {
    certificateId: `att_${randomUUID().replaceAll("-", "")}`,
    environment: input.environment,
    sourceChain: input.sourceChain,
    sourceBlock: canonicalBlock.sourceBlock,
    blockHash: canonicalBlock.blockHash,
    previousCheckpointHash: input.previousCheckpointHash,
    digest,
    signatures: signatures.map(item => ({ ...item })),
    aggregateSignature: `0xaggregate_${sha256Hex(signatures).slice(2, 26)}`,
    quorum,
    createdAt: now.toISOString(),
    continuityDepth: 1,
  };
}
