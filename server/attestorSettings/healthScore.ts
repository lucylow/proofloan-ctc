import type { AttestorNetwork, OperatorConfig } from "./types";
import { assessSettingsHealth } from "./health";

export function numericHealthScore(network: AttestorNetwork, config: OperatorConfig) {
  const health = assessSettingsHealth(network, config);
  const values = Object.values(health.checks);
  const good = values.filter(value => value === "healthy").length;
  return values.length ? Math.round((good / values.length) * 100) : 0;
}
