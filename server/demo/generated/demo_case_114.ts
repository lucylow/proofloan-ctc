import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #114.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_114 = {
  caseId: "CASE-114",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-114",
  transactionSeed: "demo-tx-114",
  sequence: 114,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_114 = typeof DEMO_CASE_114;

export function assertDemoCase_114(): true {
  if (!DEMO_CASE_114.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_114.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
