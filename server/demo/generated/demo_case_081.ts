import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #081.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_081 = {
  caseId: "CASE-081",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-081",
  transactionSeed: "demo-tx-081",
  sequence: 81,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_081 = typeof DEMO_CASE_081;

export function assertDemoCase_081(): true {
  if (!DEMO_CASE_081.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_081.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
