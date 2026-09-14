import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture046 = {
  key: "fund_audit_treasury-046",
  kind: "treasury" as ProposalKind,
  title: "ProofLoan governance scenario: fund audit treasury",
  payload: {"amount": "50000"} as const,
  actions: [{ target: "proofloan", selector: "treasury:fund_audit_treasury", params: {"amount": "50000"} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
