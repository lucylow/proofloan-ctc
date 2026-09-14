import {
  SUCCESS_RECEIPT_HEX,
  type CanonicalAttestcoinProofRecord,
} from "@shared/attestcoin";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { hashValue } from "../underwriting";
import { proofFingerprint } from "../attestcoin/fingerprint";
import { AttestcoinError } from "../attestcoin/errors";
import { validateProofBlock } from "../attestcoin/validators";
import { assertSuccessfulReceipt } from "./receipt";
import {
  assertProofMatchesObservation,
  assertSourceFinality,
  confirmationCount,
  type SourceObservation,
} from "./finality";
import { assertDeadlineOpen, type ProofDeadline } from "./deadlines";

export type ProofMaterial = {
  chainKey: number;
  headerNumber: number;
  txIndex: number;
  txHash: string;
  txBytes: string;
  merkleProof: unknown;
  continuityProof: unknown;
  generatedAt?: Date | string;
};

export type FinalizeVerifiedProofInput = {
  requestId: string;
  requestHash: string;
  environment: string;
  sourceChain: CanonicalAttestcoinProofRecord["sourceChain"];
  chainKey: number;
  txHash: string;
  observed: SourceObservation;
  proofData: ProofMaterial;
  merkleAndContinuityVerified: boolean;
  verificationBlock: number;
  computedTxIndex?: number;
  receiptStatus: number;
  decoderContract: string;
  deadline: ProofDeadline;
  nowMs?: number;
  staleProofMaxAgeMs: number;
  rejectStaleLiveProofs: boolean;
};

export function hashProofMaterial(value: unknown) {
  return `0x${hashValue({
    namespace: "proofloan:attestcoin:proof-material:v1",
    value,
  })}`;
}

export function canonicalRequestHash(input: {
  environment: string;
  sourceChain: string;
  chainKey: number;
  txHash: string;
  idempotencyKey?: string;
}) {
  return `0x${hashValue({
    namespace: "proofloan:attestcoin:canonical-request:v1",
    environment: input.environment,
    sourceChain: input.sourceChain,
    chainKey: input.chainKey,
    txHash: input.txHash.toLowerCase(),
    idempotencyKey: input.idempotencyKey ?? null,
  })}`;
}

export function proofAgeMs(generatedAt: Date | string | undefined, nowMs: number) {
  if (!generatedAt) return 0;
  const generatedMs =
    generatedAt instanceof Date ? generatedAt.getTime() : Date.parse(generatedAt);
  if (!Number.isFinite(generatedMs)) return 0;
  return Math.max(0, nowMs - generatedMs);
}

export function resolveTransactionIndex(
  proofData: ProofMaterial,
  computedTxIndex: number | undefined,
  requestId?: string,
) {
  if (typeof computedTxIndex === "number" && Number.isInteger(computedTxIndex) && computedTxIndex >= 0) {
    return computedTxIndex;
  }
  if (Number.isInteger(proofData.txIndex) && proofData.txIndex >= 0) {
    return proofData.txIndex;
  }
  throw new AttestcoinError(
    "DECODING",
    "Attestcoin proof is missing a transaction index.",
    { requestId },
  );
}

export function finalizeVerifiedProof(
  input: FinalizeVerifiedProofInput,
): CanonicalAttestcoinProofRecord {
  const nowMs = input.nowMs ?? Date.now();
  const requestId = input.requestId;
  assertDeadlineOpen(input.deadline, nowMs, requestId);

  if (!input.merkleAndContinuityVerified) {
    throw new AttestcoinError(
      "PROOF_VERIFICATION",
      `Creditcoin Block Prover Precompile ${BLOCK_PROVER_PRECOMPILE} rejected the Merkle or continuity proof.`,
      { requestId },
    );
  }

  if (input.proofData.chainKey !== input.chainKey) {
    throw new AttestcoinError(
      "PROOF_VERIFICATION",
      `Proof chainKey ${input.proofData.chainKey} does not match the official binding ${input.chainKey}.`,
      { requestId },
    );
  }

  const observedTxHash = input.observed.hash.toLowerCase();
  const requestedTxHash = input.txHash.toLowerCase();
  const proofTxHash = input.proofData.txHash.toLowerCase();
  if (observedTxHash !== requestedTxHash || proofTxHash !== requestedTxHash) {
    throw new AttestcoinError(
      "PROOF_VERIFICATION",
      "Proof transaction hash does not match the requested source transaction.",
      { requestId },
    );
  }

  assertProofMatchesObservation(
    input.proofData.headerNumber,
    input.observed.blockNumber,
    requestId,
  );
  const confirmations = assertSourceFinality(input.observed, requestId);
  assertSuccessfulReceipt(input.receiptStatus, requestId);

  if (!validateProofBlock(input.proofData.headerNumber, input.verificationBlock)) {
    throw new AttestcoinError(
      "PROOF_VERIFICATION",
      "Verification block did not satisfy ordering constraints.",
      { requestId },
    );
  }

  const ageMs = proofAgeMs(input.proofData.generatedAt, nowMs);
  if (input.rejectStaleLiveProofs && ageMs > input.staleProofMaxAgeMs) {
    throw new AttestcoinError(
      "STALE_PROOF",
      `Attestcoin proof is ${ageMs}ms old and exceeds the stale-proof window of ${input.staleProofMaxAgeMs}ms.`,
      { requestId },
    );
  }

  const txIndex = resolveTransactionIndex(input.proofData, input.computedTxIndex, requestId);
  const merkleProofHash = hashProofMaterial(input.proofData.merkleProof);
  const continuityProofHash = hashProofMaterial(input.proofData.continuityProof);
  const verifiedAt = new Date(nowMs).toISOString();
  const proofRoot = `0x${proofFingerprint({
    chainKey: input.chainKey,
    sourceBlock: input.proofData.headerNumber,
    txHash: requestedTxHash,
    proofRoot: JSON.stringify({
      merkleProofHash,
      continuityProofHash,
      txIndex,
      receiptStatus: SUCCESS_RECEIPT_HEX,
    }),
  })}`;

  return {
    requestId,
    requestHash: input.requestHash,
    environment: input.environment,
    chainKey: input.chainKey,
    sourceChain: input.sourceChain,
    sourceBlock: input.proofData.headerNumber,
    txHash: requestedTxHash,
    txIndex,
    merkleProof: input.proofData.merkleProof,
    continuityProof: input.proofData.continuityProof,
    merkleProofHash,
    continuityProofHash,
    verificationStatus: "verified",
    freshness: "Fresh",
    proofRoot,
    receiptStatus: SUCCESS_RECEIPT_HEX,
    verificationBlock: input.verificationBlock,
    confirmations: confirmations || confirmationCount(input.observed.head, input.observed.blockNumber),
    confirmationDepth: input.observed.confirmationDepth,
    blockProver: BLOCK_PROVER_PRECOMPILE,
    decoderContract: input.decoderContract,
    deadlineAt: input.deadline.deadlineAt,
    generatedAt:
      input.proofData.generatedAt instanceof Date
        ? input.proofData.generatedAt.toISOString()
        : input.proofData.generatedAt ?? verifiedAt,
    verifiedAt,
    txBytes: input.proofData.txBytes,
  };
}
