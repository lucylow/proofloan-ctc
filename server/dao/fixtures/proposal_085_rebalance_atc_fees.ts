import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture085 = {
  key: "rebalance_atc_fees-085",
  kind: "atc-fee-policy" as ProposalKind,
  title: "ProofLoan governance scenario: rebalance atc fees",
  payload: {"burnBps": 2800, "operatorRewardBps": 7200} as const,
  actions: [{ target: "proofloan", selector: "atc-fee-policy:rebalance_atc_fees", params: {"burnBps": 2800, "operatorRewardBps": 7200} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
