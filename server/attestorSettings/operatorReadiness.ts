import type { AttestorNetwork, OperatorConfig } from "./types";
import { validateOperatorConfig } from "./validation";
import { assessFreeBalance } from "./balancePolicy";

export function readiness(network: AttestorNetwork, config: OperatorConfig, balance: number) {
  const validation = validateOperatorConfig(network, config);
  const funds = assessFreeBalance(network, balance);
  return { ready: validation.valid && funds.sufficient, validation, funds };
}
