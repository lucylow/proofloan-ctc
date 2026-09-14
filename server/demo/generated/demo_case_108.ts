import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #108.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_108 = {
  caseId: "CASE-108",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-108",
  transactionSeed: "demo-tx-108",
  sequence: 108,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_108 = typeof DEMO_CASE_108;

export function assertDemoCase_108(): true {
  if (!DEMO_CASE_108.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_108.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
