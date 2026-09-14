import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #115.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_115 = {
  caseId: "CASE-115",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-115",
  transactionSeed: "demo-tx-115",
  sequence: 115,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_115 = typeof DEMO_CASE_115;

export function assertDemoCase_115(): true {
  if (!DEMO_CASE_115.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_115.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
