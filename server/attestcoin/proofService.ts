import type {
  AttestcoinMode,
  AttestcoinProofBundle,
  AttestcoinSourceChain,
} from "@shared/attestcoin";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { AttestcoinError } from "./errors";
import { normalizeTxHash } from "./validators";
import { factFromCanonicalProof } from "../multichain/facts";
import { classifyProofRequest } from "../multichain/requestPolicy";
import { verifyLiveAttestcoinProof } from "../multichain/proof";
import { recordMultichainEvent } from "../multichain/observability";

export type ProofServiceInput = {
  txHash: string;
  sourceChain: AttestcoinSourceChain;
  mode?: AttestcoinMode;
  requestId?: string;
  idempotencyKey?: string;
  deadlineMs?: number;
};

export type ProofServiceOutput = Awaited<ReturnType<AttestcoinProofService["generate"]>>;

export class AttestcoinProofService {
  async generate(input: ProofServiceInput): Promise<AttestcoinProofBundle> {
    const txHash = normalizeTxHash(input.txHash);
    const requestId = input.requestId ?? `atc_${Date.now().toString(36)}`;
    const started = Date.now();

    if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
      throw new AttestcoinError(
        "VALIDATION",
        "Invalid source transaction hash.",
        { requestId },
      );
    }

    const decision = classifyProofRequest({
      txHash,
      sourceChain: input.sourceChain,
      intent: "live",
    });

    if (decision.kind !== "live") {
      recordMultichainEvent("proof_rejected", input.sourceChain);
      throw new AttestcoinError("UNSUPPORTED_CHAIN", decision.reason, {
        requestId,
      });
    }

    try {
      const proof = await verifyLiveAttestcoinProof(
        txHash,
        input.sourceChain,
        requestId,
        {
          idempotencyKey: input.idempotencyKey,
          deadlineMs: input.deadlineMs,
        },
      );
      recordMultichainEvent("proof_live", input.sourceChain);

      return {
        receipt: {
          requestId: proof.requestId,
          requestHash: proof.requestHash,
          mode: input.mode ?? "live",
          stage: "complete",
          chainKey: proof.chainKey,
          sourceChain: input.sourceChain,
          sourceBlock: proof.sourceBlock,
          verificationBlock: proof.verificationBlock,
          txHash,
          txIndex: proof.txIndex,
          proofRoot: proof.proofRoot,
          verified: true,
          verificationStatus: proof.verificationStatus,
          receiptStatus: proof.receiptStatus,
          merkleProofPresent: true,
          continuityProofPresent: true,
          freshness: proof.freshness,
          confirmations: proof.confirmations,
          confirmationDepth: proof.confirmationDepth,
          environment: proof.environment,
          deadlineAt: proof.deadlineAt,
          blockProver: BLOCK_PROVER_PRECOMPILE,
          latencyMs: Date.now() - started,
          cached: false,
          retries: 0,
          warnings: [],
        },
        facts: [factFromCanonicalProof(proof)],
        rawProof: {
          chainKey: proof.chainKey,
          headerNumber: proof.sourceBlock,
          txIndex: proof.txIndex,
          txBytes: proof.txBytes,
          merkleProof: proof.merkleProof,
          continuityProof: proof.continuityProof,
        },
        canonicalProof: proof,
      };
    } catch (error) {
      if (error instanceof AttestcoinError) throw error;

      throw new AttestcoinError(
        "UNKNOWN",
        error instanceof Error
          ? error.message
          : "Attestcoin proof request failed.",
        {
          retriable: false,
          causeValue: error,
          requestId,
        },
      );
    }
  }
}
