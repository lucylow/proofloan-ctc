import type { ProofBundle, SourceEvent } from "@shared/readability";
import { SUCCESS_RECEIPT_STATUS } from "@shared/attestcoin";
import { createHash } from "node:crypto";
import { ReadabilityError } from "./errors";
import { assessPreviewMerkleInclusion } from "./merkle/verify";

export function verifyBundleShape(bundle: ProofBundle): void {
  if (bundle.blockHeight < 0) {
    throw new ReadabilityError("PROOF", "Invalid proof block height.");
  }
  if (!bundle.encodedTransaction.startsWith("0x")) {
    throw new ReadabilityError("PROOF", "Encoded transaction must be hex-prefixed.");
  }
  if (!bundle.merkleProofPresent) {
    throw new ReadabilityError("PROOF", "Merkle proof is missing.");
  }
  if (!bundle.continuityProofPresent) {
    throw new ReadabilityError("PROOF", "Continuity proof is missing.");
  }
  if (bundle.adapter === "preview") {
    if (!bundle.merkleRoot?.startsWith("0x")) {
      throw new ReadabilityError("PROOF", "Preview Merkle root is missing.");
    }
    if (!bundle.continuityRoots || bundle.continuityRoots.length === 0) {
      throw new ReadabilityError("PROOF", "Preview continuity proof is empty.");
    }
    const inclusion = assessPreviewMerkleInclusion(bundle);
    if (!inclusion.valid) {
      throw new ReadabilityError("PROOF", inclusion.reason ?? "Preview Merkle inclusion failed.");
    }
  }
  if (bundle.adapter === "live") {
    if (bundle.liveMerkleProof == null || bundle.liveContinuityProof == null) {
      throw new ReadabilityError("PROOF", "Live Merkle/continuity proofs are missing.");
    }
  }
}

export function bindProofToEvent(bundle: ProofBundle, event: SourceEvent): void {
  verifyBundleShape(bundle);
  if (bundle.blockHeight !== event.blockNumber) {
    throw new ReadabilityError("PROOF", "Proof block does not match the source event.");
  }
}

export function assertSuccessfulReceipt(status: number): asserts status is 1 {
  if (status !== SUCCESS_RECEIPT_STATUS) {
    throw new ReadabilityError(
      "RECEIPT",
      `Source receipt status is ${status}; readability requires status == 1 (0x1) before ProofLoan business logic.`,
    );
  }
}

export function proofDigest(bundle: ProofBundle): string {
  return createHash("sha256").update(JSON.stringify(bundle)).digest("hex");
}
