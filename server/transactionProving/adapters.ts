import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import type { AttestcoinSourceChainName } from "@shared/multichain";
import { calculateContinuityDigest } from "./continuity";
import { TransactionProvingError } from "./errors";
import type { ProofEnvelope, VerificationReport } from "./types";
import { verifyOffchainEnvelope } from "./verifier";

export const PRODUCTION_TRANSACTION_PROVING_BOUNDARIES = {
  queryPlanner: "server/transactionProving/query.ts",
  previewProver: "DeterministicMockProver — educational, not consensus",
  previewVerifier: "verifyOffchainEnvelope — structural check only",
  liveProofBuilder: "server/multichain/proof.ts + @gluwa/usc-sdk ProofBuilder",
  liveBlockProver: `PrecompileBlockProver ${BLOCK_PROVER_PRECOMPILE}`,
  localMerkleHelper: "server/transactionProving/merkle.ts is not Attestcoin consensus",
  localContinuityHelper: "server/transactionProving/continuity.ts is not Attestcoin consensus",
  extraction: "server/transactionProving/decoder.ts runs only after verification",
  receiptGuard: "requireSuccessfulReceipt / requireSuccess before ProofLoan business logic",
} as const;

export function previewVerify(envelope: ProofEnvelope): VerificationReport {
  const expectedUpper = calculateContinuityDigest(
    envelope.continuityProof.lowerEndpointDigest,
    envelope.continuityProof.roots,
  );
  const report = verifyOffchainEnvelope(envelope, expectedUpper);
  if (!report.ok) {
    throw new TransactionProvingError(
      "VERIFICATION",
      `Preview structural verification failed (merkle=${report.merkleValid}, continuity=${report.continuityValid}, size=${report.transactionSizeValid}).`,
    );
  }
  return { ...report, blockProver: BLOCK_PROVER_PRECOMPILE };
}

/**
 * Production verification stays on the existing USC SDK + Block Prover path.
 * Local Merkle/continuity helpers are never treated as a replacement.
 */
export async function liveVerify(input: {
  txHash: string;
  sourceChain: AttestcoinSourceChainName;
  requestId?: string;
}): Promise<VerificationReport> {
  const { verifyLiveAttestcoinProof } = await import("../multichain/proof");
  const proof = await verifyLiveAttestcoinProof(input.txHash, input.sourceChain, input.requestId);
  const ok = proof.verificationStatus === "verified";
  if (!ok) {
    throw new TransactionProvingError("VERIFICATION", "Block Prover rejected the live transaction proof.");
  }
  return {
    merkleValid: true,
    continuityValid: true,
    transactionSizeValid: true,
    ok: true,
    adapter: "live",
    educational: false,
    blockProver: BLOCK_PROVER_PRECOMPILE,
  };
}
