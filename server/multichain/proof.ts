import {
  BLOCK_PROVER_PRECOMPILE,
  type AttestcoinSourceChainName,
} from "@shared/multichain";
import type { CanonicalAttestcoinProofRecord } from "@shared/attestcoin";
import { AttestcoinError, normalizeAttestcoinError } from "../attestcoin/errors";
import { retryAttestcoin } from "../attestcoin/retry";
import { getCachedAttestcoinEnvironment } from "./environment";
import { requireOfficialChainKey, resolveSourceChain } from "./registry";
import { classifyProofRequest } from "./requestPolicy";
import { getSourceChainAdapter } from "./sourceAdapters";
import { withCreditcoinRpc } from "./rpc";
import { getNamedCircuit } from "./circuitBreaker";
import { createProofDeadline } from "./deadlines";
import { decodeSourceReceiptStatus } from "./receipt";
import {
  canonicalRequestHash,
  finalizeVerifiedProof,
  type ProofMaterial,
} from "./proofRecord";
import {
  beginProofRequest,
  commitProofRequest,
  failProofRequest,
  releaseProofRequest,
} from "./idempotency";
import { persistCanonicalProofRecord } from "./persistence";
import { auditRejectedProof, auditVerifiedProof } from "./audit";
import { blockProver, proofProvider } from "@gluwa/usc-sdk";

export type EnvironmentAwareProof = CanonicalAttestcoinProofRecord;

export type LiveProofOptions = {
  idempotencyKey?: string;
  deadlineMs?: number;
  now?: () => number;
  decodeReceipt?: (txBytes: string) => Promise<{ receiptStatus: number }>;
  computeTxIndex?: (merkleProof: unknown) => Promise<number>;
};

async function defaultComputeTxIndex(
  merkleProof: unknown,
  fallback: number,
): Promise<number> {
  try {
    return await withCreditcoinRpc(async provider => {
      const prover = new blockProver.PrecompileBlockProver(provider);
      return prover.computeTransactionIndex(
        merkleProof as Parameters<
          blockProver.PrecompileBlockProver["computeTransactionIndex"]
        >[0],
      );
    });
  } catch {
    return fallback;
  }
}

export async function verifyLiveAttestcoinProof(
  txHash: string,
  sourceChain: AttestcoinSourceChainName,
  requestId?: string,
  options: LiveProofOptions = {},
): Promise<CanonicalAttestcoinProofRecord> {
  const decision = classifyProofRequest({
    txHash,
    sourceChain,
    intent: "live",
  });
  if (decision.kind !== "live") {
    throw new AttestcoinError("UNSUPPORTED_CHAIN", decision.reason, {
      requestId,
    });
  }

  const environment = getCachedAttestcoinEnvironment();
  const chainKey = requireOfficialChainKey(sourceChain, environment);
  const resolved = resolveSourceChain(sourceChain, { environment });
  const adapter = getSourceChainAdapter(sourceChain);
  const now = options.now ?? Date.now;
  const requestHash = canonicalRequestHash({
    environment: environment.id,
    sourceChain,
    chainKey,
    txHash,
    idempotencyKey: options.idempotencyKey,
  });
  const resolvedRequestId = requestId ?? `atc_${now().toString(36)}`;
  const existing = beginProofRequest({
    requestHash,
    requestId: resolvedRequestId,
    nowMs: now(),
  });
  if (existing.status === "committed") {
    return existing.record;
  }

  const deadline = createProofDeadline(
    options.deadlineMs ?? environment.timeoutMs,
    now(),
  );
  const circuit = getNamedCircuit(`proof:${environment.id}:${resolved.id}`);

  try {
    const record = await circuit.run(async () => {
      const observed = await retryAttestcoin(() => adapter.observe(txHash), {
        retries: environment.retryCount,
        baseDelayMs: 250,
        maxDelayMs: 2500,
        jitterRatio: 0.2,
      });

      const builder = new proofProvider.service.ProofBuilder(
        chainKey,
        environment.proofBuilderUrl,
        environment.timeoutMs,
      );

      await retryAttestcoin(
        () => builder.waitUntilHeightAttested(chainKey, observed.blockNumber),
        {
          retries: environment.retryCount,
          baseDelayMs: 1000,
          maxDelayMs: 5000,
          jitterRatio: 0.15,
        },
      );

      const proofResult = await retryAttestcoin(() => builder.getProof(txHash), {
        retries: environment.retryCount,
        baseDelayMs: 500,
        maxDelayMs: 3000,
        jitterRatio: 0.15,
      });

      if (!proofResult.success || !proofResult.data) {
        throw new AttestcoinError(
          "PROOF_BUILDER",
          proofResult.error ?? "Attestcoin proof generation failed.",
          { retriable: true, requestId: resolvedRequestId },
        );
      }

      const proofData: ProofMaterial = {
        chainKey: proofResult.data.chainKey,
        headerNumber: proofResult.data.headerNumber,
        txIndex: proofResult.data.txIndex,
        txHash: proofResult.data.txHash || txHash,
        txBytes: proofResult.data.txBytes,
        merkleProof: proofResult.data.merkleProof,
        continuityProof: proofResult.data.continuityProof,
        generatedAt: proofResult.data.generatedAt,
      };

      const verified = await withCreditcoinRpc(async provider => {
        const prover = new blockProver.PrecompileBlockProver(provider);
        const ok = await prover.verifySingle(
          proofData.chainKey,
          proofData.headerNumber,
          proofData.txBytes,
          proofData.merkleProof as Parameters<
            blockProver.PrecompileBlockProver["verifySingle"]
          >[3],
          proofData.continuityProof as Parameters<
            blockProver.PrecompileBlockProver["verifySingle"]
          >[4],
        );
        const verificationBlock = await provider.getBlockNumber();
        return { ok, verificationBlock };
      });

      const decoded = options.decodeReceipt
        ? await options.decodeReceipt(proofData.txBytes)
        : await decodeSourceReceiptStatus(proofData.txBytes, resolvedRequestId);
      const computedTxIndex = options.computeTxIndex
        ? await options.computeTxIndex(proofData.merkleProof)
        : await defaultComputeTxIndex(proofData.merkleProof, proofData.txIndex);

      return finalizeVerifiedProof({
        requestId: resolvedRequestId,
        requestHash,
        environment: environment.id,
        sourceChain,
        chainKey,
        txHash,
        observed,
        proofData,
        merkleAndContinuityVerified: verified.ok,
        verificationBlock: verified.verificationBlock,
        computedTxIndex,
        receiptStatus: decoded.receiptStatus,
        decoderContract: environment.decoderContract,
        deadline,
        nowMs: now(),
        staleProofMaxAgeMs: environment.staleProofMaxAgeMs,
        rejectStaleLiveProofs: environment.rejectStaleLiveProofs,
      });
    });

    commitProofRequest(requestHash, record, now());
    auditVerifiedProof(record);
    void persistCanonicalProofRecord(record);
    return record;
  } catch (error) {
    const normalized = normalizeAttestcoinError(error, resolvedRequestId);
    if (normalized.retriable) {
      releaseProofRequest(requestHash);
    } else {
      failProofRequest(
        requestHash,
        resolvedRequestId,
        normalized.kind,
        normalized.message,
        now(),
      );
    }
    auditRejectedProof({
      requestHash,
      environment: environment.id,
      sourceChain,
      chainKey,
      txHash,
      kind: normalized.kind,
      message: normalized.message,
      nowMs: now(),
    });
    throw normalized;
  }
}

export function blockProverAddress() {
  return BLOCK_PROVER_PRECOMPILE;
}
