import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #003.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_003 = {
  caseId: "CASE-003",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-003",
  transactionSeed: "demo-tx-003",
  sequence: 3,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_003 = typeof DEMO_CASE_003;

export function assertDemoCase_003(): true {
  if (!DEMO_CASE_003.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_003.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
