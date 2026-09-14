import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #107.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_107 = {
  caseId: "CASE-107",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-107",
  transactionSeed: "demo-tx-107",
  sequence: 107,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_107 = typeof DEMO_CASE_107;

export function assertDemoCase_107(): true {
  if (!DEMO_CASE_107.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_107.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
