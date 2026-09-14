import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export type BalanceAssessment = {
  freeBalanceCtc: number;
  recommended: boolean;
  sufficient: boolean;
  reason: string;
};

export function assessFreeBalance(network: AttestorNetwork, balanceCtc: number): BalanceAssessment {
  const settings = getAttestorSettings(network);
  const minimum = Number(settings.minFreeBalanceCtc);
  const recommended = Number(settings.recommendedFreeBalanceCtc);

  if (!Number.isFinite(balanceCtc)) {
    return { freeBalanceCtc: balanceCtc, recommended: false, sufficient: false, reason: "Balance is not finite." };
  }
  if (balanceCtc < minimum) {
    return { freeBalanceCtc: balanceCtc, recommended: false, sufficient: false, reason: `Below the hard minimum of ${minimum} CTC.` };
  }
  if (balanceCtc < recommended) {
    return {
      freeBalanceCtc: balanceCtc,
      recommended: false,
      sufficient: true,
      reason: `Above minimum but below the recommended ${recommended} CTC operating buffer.`,
    };
  }
  return { freeBalanceCtc: balanceCtc, recommended: true, sufficient: true, reason: "Balance is above the recommended operating buffer." };
}

export function minimumBond(network: AttestorNetwork): number {
  return Number(getAttestorSettings(network).minBondRequirementCtc);
}
