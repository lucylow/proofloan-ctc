import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #007.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_007 = {
  caseId: "CASE-007",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-007",
  transactionSeed: "demo-tx-007",
  sequence: 7,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_007 = typeof DEMO_CASE_007;

export function assertDemoCase_007(): true {
  if (!DEMO_CASE_007.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_007.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
