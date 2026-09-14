import type { MockProofRequest, MockProofStatus, MockScenario, MockTransaction } from "../types";
import { atOffset, fingerprint } from "../utils";

function statusFor(index: number, scenario: MockScenario, finalized: boolean): MockProofStatus {
  if (scenario === "proof-delay") return index === 0 ? "delayed" : "attesting";
  if (scenario === "proof-rejected") return index === 0 ? "rejected" : "verified";
  if (scenario === "partial-attestation") return index === 0 ? "partial" : "proven";
  if (scenario === "recovery") return index === 0 ? "delayed" : "queued";
  if (!finalized) return "attesting";
  return "verified";
}

export function createMockProofRequests(
  transactions: MockTransaction[],
  scenario: MockScenario,
): MockProofRequest[] {
  if (scenario === "empty") return [];

  return transactions.map((transaction, index) => {
    const status = statusFor(index % 4, scenario, transaction.finalized);
    const verified = status === "verified";
    return {
      id: `prf_${transaction.id}`,
      applicationId: transaction.applicationId,
      txHash: transaction.txHash,
      chainId: transaction.chainId,
      status,
      requestedAt: transaction.timestamp,
      completedAt: verified ? atOffset(1, transaction.timestamp) : undefined,
      sourceBlock: transaction.blockNumber,
      verificationBlock: verified ? transaction.blockNumber + 12 : undefined,
      proofRoot: verified ? fingerprint({ tx: transaction.txHash, block: transaction.blockNumber }) : undefined,
      latencyMs: status === "delayed" ? 4200 : 180 + (index % 7) * 40,
      retries: status === "delayed" || status === "rejected" ? 2 : 0,
      warnings: status === "rejected"
        ? ["Creditcoin Block Prover rejected the proof."]
        : status === "partial"
          ? ["Attestation quorum is incomplete."]
          : status === "delayed"
            ? ["Waiting for source-block attestation."]
            : [],
      presentationOnly: true,
    };
  });
}
