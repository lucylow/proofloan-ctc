import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #015.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_015 = {
  caseId: "CASE-015",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-015",
  transactionSeed: "demo-tx-015",
  sequence: 15,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_015 = typeof DEMO_CASE_015;

export function assertDemoCase_015(): true {
  if (!DEMO_CASE_015.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_015.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
