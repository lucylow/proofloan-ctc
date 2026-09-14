import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #041.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_041 = {
  caseId: "CASE-041",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-041",
  transactionSeed: "demo-tx-041",
  sequence: 41,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_041 = typeof DEMO_CASE_041;

export function assertDemoCase_041(): true {
  if (!DEMO_CASE_041.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_041.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
