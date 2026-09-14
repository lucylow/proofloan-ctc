import type { SourceChain, VerifiedFact } from "@shared/proofloan";
import type { AttestorServiceSnapshot } from "@shared/attestors";
import { hashValue } from "../underwriting";
import { AttestcoinError } from "./errors";
import { classifyProofRequest } from "../multichain/requestPolicy";
import { previewFactsFor } from "../multichain/facts";
import { verifyLiveAttestcoinProof } from "../multichain/proof";
import { recordMultichainEvent } from "../multichain/observability";
import { attestorService } from "../attestors";
import { currentAttestorEnvironment } from "../attestors/operational";

export type AttestcoinProofResult = {
  verified: boolean;
  chainKey: number;
  sourceBlock: number;
  verificationBlock: number;
  txHash: string;
  proofRoot: string;
  mode: "sdk" | "preview-fallback";
  environment?: string;
  attestorNetwork?: AttestorServiceSnapshot;
};

export async function verifyTransactionWithAttestcoin(
  txHash: string,
  sourceChain: SourceChain,
): Promise<AttestcoinProofResult> {
  const decision = classifyProofRequest({
    txHash,
    sourceChain,
    intent: "live",
  });

  if (decision.kind !== "live") {
    recordMultichainEvent("proof_rejected", sourceChain);
    throw new AttestcoinError("UNSUPPORTED_CHAIN", decision.reason);
  }

  const proof = await verifyLiveAttestcoinProof(txHash, sourceChain);
  recordMultichainEvent("proof_live", sourceChain);

  return {
    verified: true,
    chainKey: proof.chainKey,
    sourceBlock: proof.sourceBlock,
    verificationBlock: proof.verificationBlock,
    txHash,
    proofRoot: `0x${hashValue({
      txHash,
      headerNumber: proof.sourceBlock,
      chainKey: proof.chainKey,
      environment: proof.environment,
    })}`,
    mode: "sdk",
    environment: proof.environment,
    attestorNetwork: attestorService.snapshot(currentAttestorEnvironment(proof.environment)),
  };
}

export function previewAttestcoinFacts(
  walletAddress: string,
  sourceChain: SourceChain,
): VerifiedFact[] {
  recordMultichainEvent("proof_preview", sourceChain);
  return previewFactsFor(walletAddress, sourceChain);
}
