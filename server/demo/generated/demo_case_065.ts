import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #065.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_065 = {
  caseId: "CASE-065",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-065",
  transactionSeed: "demo-tx-065",
  sequence: 65,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_065 = typeof DEMO_CASE_065;

export function assertDemoCase_065(): true {
  if (!DEMO_CASE_065.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_065.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
