import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #089.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_089 = {
  caseId: "CASE-089",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-089",
  transactionSeed: "demo-tx-089",
  sequence: 89,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_089 = typeof DEMO_CASE_089;

export function assertDemoCase_089(): true {
  if (!DEMO_CASE_089.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_089.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
