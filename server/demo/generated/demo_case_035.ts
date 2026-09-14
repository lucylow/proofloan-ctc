import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #035.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_035 = {
  caseId: "CASE-035",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-035",
  transactionSeed: "demo-tx-035",
  sequence: 35,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_035 = typeof DEMO_CASE_035;

export function assertDemoCase_035(): true {
  if (!DEMO_CASE_035.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_035.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
