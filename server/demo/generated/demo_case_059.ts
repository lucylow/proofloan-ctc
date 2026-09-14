import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #059.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_059 = {
  caseId: "CASE-059",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-059",
  transactionSeed: "demo-tx-059",
  sequence: 59,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_059 = typeof DEMO_CASE_059;

export function assertDemoCase_059(): true {
  if (!DEMO_CASE_059.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_059.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
