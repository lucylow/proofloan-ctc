import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #025.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_025 = {
  caseId: "CASE-025",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-025",
  transactionSeed: "demo-tx-025",
  sequence: 25,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_025 = typeof DEMO_CASE_025;

export function assertDemoCase_025(): true {
  if (!DEMO_CASE_025.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_025.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
