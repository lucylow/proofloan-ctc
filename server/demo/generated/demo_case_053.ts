import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #053.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_053 = {
  caseId: "CASE-053",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-053",
  transactionSeed: "demo-tx-053",
  sequence: 53,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_053 = typeof DEMO_CASE_053;

export function assertDemoCase_053(): true {
  if (!DEMO_CASE_053.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_053.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
