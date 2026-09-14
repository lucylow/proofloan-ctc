import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #060.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_060 = {
  caseId: "CASE-060",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-060",
  transactionSeed: "demo-tx-060",
  sequence: 60,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_060 = typeof DEMO_CASE_060;

export function assertDemoCase_060(): true {
  if (!DEMO_CASE_060.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_060.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
