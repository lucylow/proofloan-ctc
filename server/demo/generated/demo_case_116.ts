import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #116.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_116 = {
  caseId: "CASE-116",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-116",
  transactionSeed: "demo-tx-116",
  sequence: 116,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_116 = typeof DEMO_CASE_116;

export function assertDemoCase_116(): true {
  if (!DEMO_CASE_116.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_116.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
