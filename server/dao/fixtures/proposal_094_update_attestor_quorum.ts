import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture094 = {
  key: "update_attestor_quorum-094",
  kind: "attestor-policy" as ProposalKind,
  title: "ProofLoan governance scenario: update attestor quorum",
  payload: {"minQuorumBps": 7000} as const,
  actions: [{ target: "proofloan", selector: "attestor-policy:update_attestor_quorum", params: {"minQuorumBps": 7000} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
