import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #010.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_010 = {
  caseId: "CASE-010",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-010",
  transactionSeed: "demo-tx-010",
  sequence: 10,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_010 = typeof DEMO_CASE_010;

export function assertDemoCase_010(): true {
  if (!DEMO_CASE_010.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_010.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
