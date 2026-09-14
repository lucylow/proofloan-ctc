import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #031.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_031 = {
  caseId: "CASE-031",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-031",
  transactionSeed: "demo-tx-031",
  sequence: 31,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_031 = typeof DEMO_CASE_031;

export function assertDemoCase_031(): true {
  if (!DEMO_CASE_031.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_031.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
