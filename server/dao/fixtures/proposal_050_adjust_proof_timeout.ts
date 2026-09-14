import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture050 = {
  key: "adjust_proof_timeout-050",
  kind: "parameter" as ProposalKind,
  title: "ProofLoan governance scenario: adjust proof timeout",
  payload: {"timeoutSeconds": 1800} as const,
  actions: [{ target: "proofloan", selector: "parameter:adjust_proof_timeout", params: {"timeoutSeconds": 1800} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
