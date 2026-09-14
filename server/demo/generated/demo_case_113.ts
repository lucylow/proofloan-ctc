import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #113.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_113 = {
  caseId: "CASE-113",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-113",
  transactionSeed: "demo-tx-113",
  sequence: 113,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_113 = typeof DEMO_CASE_113;

export function assertDemoCase_113(): true {
  if (!DEMO_CASE_113.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_113.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
