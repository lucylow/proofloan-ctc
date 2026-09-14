import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture099 = {
  key: "enable_testnet_env-099",
  kind: "environment" as ProposalKind,
  title: "ProofLoan governance scenario: enable testnet env",
  payload: {"environment": "cc3-testnet"} as const,
  actions: [{ target: "proofloan", selector: "environment:enable_testnet_env", params: {"environment": "cc3-testnet"} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
