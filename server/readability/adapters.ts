import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import type { ReadabilityReceipt } from "@shared/readability";
import type { CanonicalAttestcoinProofRecord } from "@shared/attestcoin";
import { SUCCESS_RECEIPT_STATUS } from "@shared/attestcoin";
import { proofProvider } from "@gluwa/usc-sdk";
import { getCachedAttestcoinEnvironment } from "../multichain/environment";
import { requireOfficialChainKey } from "../multichain/registry";
import { verifyLiveAttestcoinProof } from "../multichain/proof";
import { retryAttestcoin } from "../attestcoin/retry";
import type { AttestationProvider, ProofBuilder } from "./types";
import type { AttestationSnapshot } from "./attestation";
import { ReadabilityError, normalizeReadabilityError } from "./errors";
import type { ProofBundle, ReadabilityQuery, SourceEvent } from "@shared/readability";
import { assertSuccessfulReceipt } from "./proof-validation";

import { PreviewAttestationProvider, PRODUCTION_READABILITY_BOUNDARIES } from "./preview-adapters";

export { PreviewAttestationProvider, PRODUCTION_READABILITY_BOUNDARIES };

export class LiveAttestationProvider implements AttestationProvider {
  readonly kind = "live" as const;

  async waitForAttestation(input: {
    chainKey: number;
    blockNumber: number;
    blockHash: string;
    timeoutMs: number;
  }): Promise<AttestationSnapshot> {
    const environment = getCachedAttestcoinEnvironment();
    const builder = new proofProvider.service.ProofBuilder(
      input.chainKey,
      environment.proofBuilderUrl,
      input.timeoutMs,
    );
    try {
      await retryAttestcoin(
        () => builder.waitUntilHeightAttested(input.chainKey, input.blockNumber),
        {
          retries: environment.retryCount,
          baseDelayMs: 1000,
          maxDelayMs: 5000,
          jitterRatio: 0.15,
        },
      );
    } catch (error) {
      throw normalizeReadabilityError(error);
    }
    const now = new Date();
    return {
      chainKey: input.chainKey,
      sourceBlock: input.blockNumber,
      sourceBlockHash: input.blockHash,
      attestedAt: now.toISOString(),
      validUntil: new Date(now.getTime() + environment.staleProofMaxAgeMs).toISOString(),
    };
  }
}

export class LiveUscSdkProofBuilder implements ProofBuilder {
  readonly kind = "live" as const;

  async build(query: ReadabilityQuery, event: SourceEvent): Promise<ProofBundle> {
    const chainKey = requireOfficialChainKey(query.sourceChain, query.environment);
    const environment = getCachedAttestcoinEnvironment();
    const builder = new proofProvider.service.ProofBuilder(
      chainKey,
      environment.proofBuilderUrl,
      environment.timeoutMs,
    );
    const proofResult = await retryAttestcoin(
      () => builder.getProof(event.transactionHash),
      {
        retries: environment.retryCount,
        baseDelayMs: 500,
        maxDelayMs: 3000,
        jitterRatio: 0.15,
      },
    ).catch(error => {
      throw normalizeReadabilityError(error);
    });
    if (!proofResult.success || !proofResult.data) {
      throw new ReadabilityError(
        "PROOF",
        proofResult.error ?? "Attestcoin Proof Builder failed to construct Merkle/continuity proofs.",
        true,
      );
    }
    return {
      adapter: "live",
      chainKey: proofResult.data.chainKey,
      blockHeight: proofResult.data.headerNumber,
      encodedTransaction: proofResult.data.txBytes,
      merkleProofPresent: Boolean(proofResult.data.merkleProof),
      continuityProofPresent: Boolean(proofResult.data.continuityProof),
      liveMerkleProof: proofResult.data.merkleProof,
      liveContinuityProof: proofResult.data.continuityProof,
      txIndex: proofResult.data.txIndex,
      proofRoot: proofResult.data.txHash,
    };
  }
}

export async function deliverLiveReadability(input: {
  environment: ReadabilityQuery["environment"];
  sourceChain: ReadabilityQuery["sourceChain"];
  sourceContract: string;
  eventName: string;
  transactionHash: string;
  minConfirmations?: number;
  requestId?: string;
}): Promise<ReadabilityReceipt> {
  try {
    assertExplicitLiveEvent(input.eventName);
    const proof = await verifyLiveAttestcoinProof(
      input.transactionHash,
      input.sourceChain,
      input.requestId,
    );
    assertSuccessfulReceipt(receiptStatusNumber(proof));
    return receiptFromCanonicalProof(proof, input.environment);
  } catch (error) {
    throw normalizeReadabilityError(error);
  }
}

function assertExplicitLiveEvent(eventName: string): void {
  if (eventName === "Transfer" || eventName === "Approval") {
    throw new ReadabilityError(
      "EVENT_POLICY",
      `Live readability refuses generic ${eventName} triggers.`,
    );
  }
}

function receiptStatusNumber(proof: CanonicalAttestcoinProofRecord): number {
  return proof.receiptStatus === "0x1" ? SUCCESS_RECEIPT_STATUS : 0;
}

export function receiptFromCanonicalProof(
  proof: CanonicalAttestcoinProofRecord,
  environment: ReadabilityQuery["environment"],
): ReadabilityReceipt {
  return {
    queryId: proof.requestId,
    environment: proof.environment === "cc3-mainnet" || environment === "cc3-mainnet" ? "cc3-mainnet" : "cc3-testnet",
    adapter: "live",
    transactionHash: proof.txHash,
    verified: proof.verificationStatus === "verified",
    receiptStatus: 1,
    deliveredAt: new Date().toISOString(),
    chainKey: proof.chainKey,
    sourceBlock: proof.sourceBlock,
    proofRoot: proof.proofRoot,
    blockProver: BLOCK_PROVER_PRECOMPILE,
    educational: false,
  };
}
