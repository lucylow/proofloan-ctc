import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #105.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_105 = {
  caseId: "CASE-105",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-105",
  transactionSeed: "demo-tx-105",
  sequence: 105,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_105 = typeof DEMO_CASE_105;

export function assertDemoCase_105(): true {
  if (!DEMO_CASE_105.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_105.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
