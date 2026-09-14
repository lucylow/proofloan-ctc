import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #009.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_009 = {
  caseId: "CASE-009",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-009",
  transactionSeed: "demo-tx-009",
  sequence: 9,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_009 = typeof DEMO_CASE_009;

export function assertDemoCase_009(): true {
  if (!DEMO_CASE_009.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_009.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
