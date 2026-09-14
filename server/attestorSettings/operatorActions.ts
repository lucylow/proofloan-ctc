import type { AttestorNetwork, OperatorConfig } from "./types";
import { getAttestorSettings } from "./registry";
import { nextActions, type OnChainAttestorStatus } from "./lifecycle";

export function actionPlan(
  network: AttestorNetwork,
  state: { status: OnChainAttestorStatus; authorized: boolean },
  config: OperatorConfig,
) {
  const settings = getAttestorSettings(network);
  return {
    network,
    chainKey: settings.chainKey,
    operator: config.name,
    actions: nextActions(network, state.status, state.authorized),
    safety: {
      preserveStashSeparation: true,
      doNotAutoSubmitGovernanceAuthorization: true,
      doNotAutoGenerateSecrets: true,
      requireExplicitProductionEndpointConfirmation: true,
    },
  };
}
