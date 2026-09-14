import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #049.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_049 = {
  caseId: "CASE-049",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-049",
  transactionSeed: "demo-tx-049",
  sequence: 49,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_049 = typeof DEMO_CASE_049;

export function assertDemoCase_049(): true {
  if (!DEMO_CASE_049.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_049.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
