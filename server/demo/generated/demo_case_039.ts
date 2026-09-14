import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #039.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_039 = {
  caseId: "CASE-039",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-039",
  transactionSeed: "demo-tx-039",
  sequence: 39,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_039 = typeof DEMO_CASE_039;

export function assertDemoCase_039(): true {
  if (!DEMO_CASE_039.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_039.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
