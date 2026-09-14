import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #106.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_106 = {
  caseId: "CASE-106",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-106",
  transactionSeed: "demo-tx-106",
  sequence: 106,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_106 = typeof DEMO_CASE_106;

export function assertDemoCase_106(): true {
  if (!DEMO_CASE_106.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_106.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
