import type { AttestorNetwork, OperatorConfig } from "./types";
import { getAttestorSettings } from "./registry";
import { validateOperatorConfig } from "./validation";

export type DependencyHealth = "healthy" | "degraded" | "unavailable";

export function assessSettingsHealth(
  network: AttestorNetwork,
  config: OperatorConfig,
  checks?: {
    cc3Reachable?: boolean;
    ethReachable?: boolean;
    p2pReachable?: boolean;
    bootNodeKnown?: boolean;
  },
): { status: DependencyHealth; checks: Record<string, DependencyHealth> } {
  const settings = getAttestorSettings(network);
  const validation = validateOperatorConfig(network, config);
  const result: Record<string, DependencyHealth> = {
    config: validation.valid
      ? (validation.issues.some(issue => issue.severity === "warning") ? "degraded" : "healthy")
      : "unavailable",
    cc3: checks?.cc3Reachable === false ? "unavailable" : checks?.cc3Reachable === true ? "healthy" : "degraded",
    ethereum: checks?.ethReachable === false ? "unavailable" : checks?.ethReachable === true ? "healthy" : "degraded",
    p2p: checks?.p2pReachable === false ? "unavailable" : checks?.p2pReachable === true ? "healthy" : "degraded",
    bootNode: settings.productionBootNodesRequired && checks?.bootNodeKnown === false
      ? "unavailable"
      : checks?.bootNodeKnown
        ? "healthy"
        : "degraded",
  };
  const values = Object.values(result);
  return {
    status: values.includes("unavailable") ? "unavailable" : values.includes("degraded") ? "degraded" : "healthy",
    checks: result,
  };
}
