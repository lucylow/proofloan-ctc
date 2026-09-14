import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #067.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_067 = {
  caseId: "CASE-067",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-067",
  transactionSeed: "demo-tx-067",
  sequence: 67,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_067 = typeof DEMO_CASE_067;

export function assertDemoCase_067(): true {
  if (!DEMO_CASE_067.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_067.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
