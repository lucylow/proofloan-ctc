import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #074.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_074 = {
  caseId: "CASE-074",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-074",
  transactionSeed: "demo-tx-074",
  sequence: 74,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_074 = typeof DEMO_CASE_074;

export function assertDemoCase_074(): true {
  if (!DEMO_CASE_074.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_074.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
