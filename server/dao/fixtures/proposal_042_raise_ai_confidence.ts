import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture042 = {
  key: "raise_ai_confidence-042",
  kind: "ai-model" as ProposalKind,
  title: "ProofLoan governance scenario: raise ai confidence",
  payload: {"minConfidenceBps": 8200} as const,
  actions: [{ target: "proofloan", selector: "ai-model:raise_ai_confidence", params: {"minConfidenceBps": 8200} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
