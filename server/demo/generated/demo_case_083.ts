import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #083.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_083 = {
  caseId: "CASE-083",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-083",
  transactionSeed: "demo-tx-083",
  sequence: 83,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_083 = typeof DEMO_CASE_083;

export function assertDemoCase_083(): true {
  if (!DEMO_CASE_083.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_083.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
