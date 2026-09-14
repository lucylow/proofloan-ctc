import type { MockEvidenceNode, MockEvidenceSnapshot, MockProofRequest, MockVerifiedFact } from "../types";
import { fingerprint } from "../utils";

export function createMockEvidenceGraph(
  facts: MockVerifiedFact[],
  proofs: MockProofRequest[],
): MockEvidenceNode[] {
  const nodes: MockEvidenceNode[] = [];

  for (const proof of proofs) {
    nodes.push({
      id: `node_proof_${proof.id}`,
      applicationId: proof.applicationId,
      kind: "proof",
      refId: proof.id,
      label: `Proof ${proof.status}`,
    });
  }

  for (const fact of facts) {
    const parent = proofs.find(proof => proof.txHash === fact.txHash);
    nodes.push({
      id: `node_fact_${fact.id}`,
      applicationId: fact.applicationId,
      kind: "fact",
      refId: fact.id,
      parentId: parent ? `node_proof_${parent.id}` : undefined,
      label: fact.eventType,
    });
  }

  return nodes;
}

export function createMockEvidenceSnapshots(facts: MockVerifiedFact[]): MockEvidenceSnapshot[] {
  const byApplication = new Map<string, MockVerifiedFact[]>();
  for (const fact of facts) {
    const list = byApplication.get(fact.applicationId) ?? [];
    list.push(fact);
    byApplication.set(fact.applicationId, list);
  }

  return Array.from(byApplication.entries()).map(([applicationId, list]) => {
    const score = list.length === 0
      ? 0
      : Math.round((list.reduce((total: number, fact: MockVerifiedFact) => total + (fact.freshness === "Fresh" ? 1 : fact.freshness === "Aging" ? 0.55 : 0.1), 0) / list.length) * 100);
    return {
      applicationId,
      evidenceRoot: fingerprint(list.map((fact: MockVerifiedFact) => fact.proofRoot)),
      factCount: list.length,
      freshnessScore: score,
      chainCount: new Set(list.map((fact: MockVerifiedFact) => fact.chainId)).size,
    };
  });
}
