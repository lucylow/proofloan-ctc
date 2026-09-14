import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #051.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_051 = {
  caseId: "CASE-051",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-051",
  transactionSeed: "demo-tx-051",
  sequence: 51,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_051 = typeof DEMO_CASE_051;

export function assertDemoCase_051(): true {
  if (!DEMO_CASE_051.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_051.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
