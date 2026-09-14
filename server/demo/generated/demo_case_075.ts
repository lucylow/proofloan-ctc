import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #075.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_075 = {
  caseId: "CASE-075",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-075",
  transactionSeed: "demo-tx-075",
  sequence: 75,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_075 = typeof DEMO_CASE_075;

export function assertDemoCase_075(): true {
  if (!DEMO_CASE_075.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_075.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
