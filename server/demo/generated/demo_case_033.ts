import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #033.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_033 = {
  caseId: "CASE-033",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-033",
  transactionSeed: "demo-tx-033",
  sequence: 33,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_033 = typeof DEMO_CASE_033;

export function assertDemoCase_033(): true {
  if (!DEMO_CASE_033.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_033.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
