import { MOCK_DECODER_VERSION, MOCK_VERIFIER } from "../constants";
import { mockChainName } from "../chainCatalog";
import type { MockFreshness, MockProofRequest, MockScenario, MockTransaction, MockVerifiedFact } from "../types";

function freshnessFor(scenario: MockScenario, index: number): MockFreshness {
  if (scenario === "fresh-evidence" || scenario === "judge") return "Fresh";
  if (scenario === "aging-evidence") return index % 2 === 0 ? "Aging" : "Stale";
  if (index > 3) return "Aging";
  return "Fresh";
}

export function createMockFacts(
  transactions: MockTransaction[],
  proofs: MockProofRequest[],
  scenario: MockScenario,
): MockVerifiedFact[] {
  const proofByTx = new Map(proofs.map(proof => [proof.txHash, proof]));

  return transactions.flatMap((transaction, index) => {
    const proof = proofByTx.get(transaction.txHash);
    if (!proof) return [];
    const sourceVerified = proof.status === "verified";
    return [{
      id: `vf_${transaction.id}`,
      applicationId: transaction.applicationId,
      chainId: transaction.chainId,
      chainName: mockChainName(transaction.chainId),
      sourceBlock: transaction.blockNumber,
      txHash: transaction.txHash,
      eventType: transaction.eventType,
      amount: transaction.amount,
      asset: transaction.asset,
      verificationBlock: proof.verificationBlock ?? transaction.blockNumber,
      verifiedAt: proof.completedAt ?? transaction.timestamp,
      observedAt: transaction.timestamp,
      freshness: freshnessFor(scenario, index),
      proofRoot: proof.proofRoot ?? `0xpreview_${transaction.id}`,
      verifier: sourceVerified ? "Attestcoin proof worker" : MOCK_VERIFIER,
      sourceVerified,
      decoderVersion: MOCK_DECODER_VERSION,
    }];
  });
}
