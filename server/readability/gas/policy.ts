import { READABILITY_GAS_POLICY } from "./constants";

export type GasPolicyDecision = {
  allow: boolean;
  reason: string;
  maxTransactionBytes: number;
  warningContinuityHashes: number;
};

export function evaluateGasPolicy(args: {
  continuityHashes: number;
  transactionBytes: number;
}): GasPolicyDecision {
  if (args.transactionBytes > READABILITY_GAS_POLICY.maxTransactionBytes) {
    return {
      allow: false,
      reason: "transaction-too-large",
      maxTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes,
      warningContinuityHashes: READABILITY_GAS_POLICY.warningContinuityHashes,
    };
  }
  if (args.continuityHashes >= READABILITY_GAS_POLICY.highContinuityHashes) {
    return {
      allow: true,
      reason: "historical-high-cost",
      maxTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes,
      warningContinuityHashes: READABILITY_GAS_POLICY.warningContinuityHashes,
    };
  }
  return {
    allow: true,
    reason: "within-policy",
    maxTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes,
    warningContinuityHashes: READABILITY_GAS_POLICY.warningContinuityHashes,
  };
}
