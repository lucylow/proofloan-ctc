import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture008 = {
  key: "emergency_freeze_offers-008",
  kind: "emergency" as ProposalKind,
  title: "ProofLoan governance scenario: emergency freeze offers",
  payload: {"system": "credit-offers"} as const,
  actions: [{ target: "proofloan", selector: "emergency:emergency_freeze_offers", params: {"system": "credit-offers"} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
