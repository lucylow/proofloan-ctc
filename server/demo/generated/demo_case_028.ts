import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #028.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_028 = {
  caseId: "CASE-028",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-028",
  transactionSeed: "demo-tx-028",
  sequence: 28,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_028 = typeof DEMO_CASE_028;

export function assertDemoCase_028(): true {
  if (!DEMO_CASE_028.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_028.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
