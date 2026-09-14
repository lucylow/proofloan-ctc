import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #019.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_019 = {
  caseId: "CASE-019",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-019",
  transactionSeed: "demo-tx-019",
  sequence: 19,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_019 = typeof DEMO_CASE_019;

export function assertDemoCase_019(): true {
  if (!DEMO_CASE_019.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_019.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
