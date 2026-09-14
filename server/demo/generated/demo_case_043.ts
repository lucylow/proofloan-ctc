import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #043.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_043 = {
  caseId: "CASE-043",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-043",
  transactionSeed: "demo-tx-043",
  sequence: 43,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_043 = typeof DEMO_CASE_043;

export function assertDemoCase_043(): true {
  if (!DEMO_CASE_043.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_043.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
