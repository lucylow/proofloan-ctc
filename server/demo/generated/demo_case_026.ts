import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #026.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_026 = {
  caseId: "CASE-026",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-026",
  transactionSeed: "demo-tx-026",
  sequence: 26,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_026 = typeof DEMO_CASE_026;

export function assertDemoCase_026(): true {
  if (!DEMO_CASE_026.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_026.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
