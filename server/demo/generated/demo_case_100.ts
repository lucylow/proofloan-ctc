import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #100.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_100 = {
  caseId: "CASE-100",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-100",
  transactionSeed: "demo-tx-100",
  sequence: 100,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_100 = typeof DEMO_CASE_100;

export function assertDemoCase_100(): true {
  if (!DEMO_CASE_100.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_100.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
