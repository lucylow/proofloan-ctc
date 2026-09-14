import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture021 = {
  key: "increase_evidence_floor-021",
  kind: "risk-policy" as ProposalKind,
  title: "ProofLoan governance scenario: increase evidence floor",
  payload: {"minEvidenceCount": 5} as const,
  actions: [{ target: "proofloan", selector: "risk-policy:increase_evidence_floor", params: {"minEvidenceCount": 5} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
