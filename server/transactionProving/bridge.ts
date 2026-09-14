import type { ProofBundle } from "@shared/readability";
import { ReadabilityError } from "../readability/errors";
import { encodedBytesFromHex } from "../readability/gas/payload-guard";
import { DEFAULT_MAX_TX_BYTES } from "./constants";
import { classifyPayloadRisk } from "./risk";
import type { ProofDecision } from "./types";

function continuityHashCountFromBundle(bundle: ProofBundle): number {
  if (bundle.continuityRoots?.length) return bundle.continuityRoots.length;
  return bundle.continuityProofPresent ? 1 : 0;
}

export function assertReadabilityProofSafety(bundle: ProofBundle): ProofDecision {
  const bytes = encodedBytesFromHex(bundle.encodedTransaction);
  const hashes = continuityHashCountFromBundle(bundle);
  if (bytes > DEFAULT_MAX_TX_BYTES) {
    throw new ReadabilityError(
      "PROOF",
      `Encoded transaction exceeds the ${DEFAULT_MAX_TX_BYTES} byte proving guard.`,
    );
  }
  const decision = classifyPayloadRisk(bytes, hashes);
  if (!decision.allowed) {
    throw new ReadabilityError("PROOF", decision.reasonCodes.join(","));
  }
  return decision;
}
