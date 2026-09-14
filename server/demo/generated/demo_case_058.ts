import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #058.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_058 = {
  caseId: "CASE-058",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-058",
  transactionSeed: "demo-tx-058",
  sequence: 58,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_058 = typeof DEMO_CASE_058;

export function assertDemoCase_058(): true {
  if (!DEMO_CASE_058.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_058.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
