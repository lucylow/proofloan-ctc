import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #099.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_099 = {
  caseId: "CASE-099",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-099",
  transactionSeed: "demo-tx-099",
  sequence: 99,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_099 = typeof DEMO_CASE_099;

export function assertDemoCase_099(): true {
  if (!DEMO_CASE_099.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_099.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
