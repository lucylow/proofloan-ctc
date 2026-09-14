import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #084.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_084 = {
  caseId: "CASE-084",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-084",
  transactionSeed: "demo-tx-084",
  sequence: 84,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_084 = typeof DEMO_CASE_084;

export function assertDemoCase_084(): true {
  if (!DEMO_CASE_084.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_084.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
