import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #001.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_001 = {
  caseId: "CASE-001",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-001",
  transactionSeed: "demo-tx-001",
  sequence: 1,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_001 = typeof DEMO_CASE_001;

export function assertDemoCase_001(): true {
  if (!DEMO_CASE_001.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_001.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
