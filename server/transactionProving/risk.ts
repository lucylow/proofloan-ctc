import {
  DEFAULT_MAX_TX_BYTES,
  HIGH_COST_CTC,
  LARGE_TRANSACTION_BYTES,
  LONG_CONTINUITY_HASHES,
} from "./constants";
import type { ProofDecision, ProofEnvelope, ProofRisk } from "./types";
import { estimateContinuityCost } from "./cost";

export function classifyPayloadRisk(bytes: number, hashes: number): ProofDecision {
  const reasons: string[] = [];
  if (bytes > DEFAULT_MAX_TX_BYTES) {
    return {
      allowed: false,
      risk: "blocked",
      reasonCodes: ["TX_TOO_LARGE"],
      continuityHashCount: hashes,
      transactionBytes: bytes,
    };
  }
  if (hashes > LONG_CONTINUITY_HASHES) reasons.push("LONG_CONTINUITY");
  if (bytes > LARGE_TRANSACTION_BYTES) reasons.push("LARGE_TRANSACTION");
  const estimated = estimateContinuityCost(hashes);
  if (estimated > HIGH_COST_CTC) reasons.push("HIGH_ESTIMATED_COST");
  const risk: ProofRisk =
    reasons.includes("LONG_CONTINUITY") || reasons.includes("LARGE_TRANSACTION")
      ? "high"
      : reasons.length
        ? "medium"
        : "low";
  return {
    allowed: true,
    risk,
    reasonCodes: reasons,
    estimatedGasCtc: estimated,
    continuityHashCount: hashes,
    transactionBytes: bytes,
  };
}

export function classifyProofRisk(envelope: ProofEnvelope): ProofDecision {
  return classifyPayloadRisk(envelope.transaction.byteLength, envelope.continuityProof.hashCount);
}
