import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #076.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_076 = {
  caseId: "CASE-076",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-076",
  transactionSeed: "demo-tx-076",
  sequence: 76,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_076 = typeof DEMO_CASE_076;

export function assertDemoCase_076(): true {
  if (!DEMO_CASE_076.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_076.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
