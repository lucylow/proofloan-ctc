import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #045.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_045 = {
  caseId: "CASE-045",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-045",
  transactionSeed: "demo-tx-045",
  sequence: 45,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_045 = typeof DEMO_CASE_045;

export function assertDemoCase_045(): true {
  if (!DEMO_CASE_045.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_045.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
