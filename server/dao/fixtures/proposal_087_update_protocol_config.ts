import type { ProposalKind, ProposalAction } from "../core/types";
export const proposalFixture087 = {
  key: "update_protocol_config-087",
  kind: "protocol-config" as ProposalKind,
  title: "ProofLoan governance scenario: update protocol config",
  payload: {"maxActions": 10} as const,
  actions: [{ target: "proofloan", selector: "protocol-config:update_protocol_config", params: {"maxActions": 10} as const, value: "0", description: "Deterministic fixture for governance simulation." }] as ProposalAction[],
};
