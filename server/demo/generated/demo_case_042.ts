import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #042.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_042 = {
  caseId: "CASE-042",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-042",
  transactionSeed: "demo-tx-042",
  sequence: 42,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_042 = typeof DEMO_CASE_042;

export function assertDemoCase_042(): true {
  if (!DEMO_CASE_042.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_042.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
