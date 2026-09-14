import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #093.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_093 = {
  caseId: "CASE-093",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-093",
  transactionSeed: "demo-tx-093",
  sequence: 93,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_093 = typeof DEMO_CASE_093;

export function assertDemoCase_093(): true {
  if (!DEMO_CASE_093.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_093.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
