import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #021.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_021 = {
  caseId: "CASE-021",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-021",
  transactionSeed: "demo-tx-021",
  sequence: 21,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_021 = typeof DEMO_CASE_021;

export function assertDemoCase_021(): true {
  if (!DEMO_CASE_021.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_021.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
