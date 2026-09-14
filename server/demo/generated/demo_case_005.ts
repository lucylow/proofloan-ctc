import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #005.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_005 = {
  caseId: "CASE-005",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-005",
  transactionSeed: "demo-tx-005",
  sequence: 5,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_005 = typeof DEMO_CASE_005;

export function assertDemoCase_005(): true {
  if (!DEMO_CASE_005.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_005.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
