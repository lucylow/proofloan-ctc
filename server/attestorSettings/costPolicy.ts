import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function operatingCostHints(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    minimumFreeBalance: item.minFreeBalanceCtc,
    recommendedFreeBalance: item.recommendedFreeBalanceCtc,
    minBond: item.minBondRequirementCtc,
    feeRefundsExpectedForSuccessfulAttestations: true,
  };
}
