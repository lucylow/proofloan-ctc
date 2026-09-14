import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #101.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_101 = {
  caseId: "CASE-101",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-101",
  transactionSeed: "demo-tx-101",
  sequence: 101,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_101 = typeof DEMO_CASE_101;

export function assertDemoCase_101(): true {
  if (!DEMO_CASE_101.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_101.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
