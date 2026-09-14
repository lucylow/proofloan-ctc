import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture023 = {
  key: "admit_new_attestor-023",
  kind: "attestor-admission" as ProposalKind,
  title: "ProofLoan governance scenario: admit new attestor",
  payload: {"attestor": "cc3:operator-demo"} as const,
  actions: [{ target: "proofloan", selector: "attestor-admission:admit_new_attestor", params: {"attestor": "cc3:operator-demo"} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
