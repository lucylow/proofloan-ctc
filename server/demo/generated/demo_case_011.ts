import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #011.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_011 = {
  caseId: "CASE-011",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-011",
  transactionSeed: "demo-tx-011",
  sequence: 11,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_011 = typeof DEMO_CASE_011;

export function assertDemoCase_011(): true {
  if (!DEMO_CASE_011.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_011.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
