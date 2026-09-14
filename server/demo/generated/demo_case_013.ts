import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #013.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_013 = {
  caseId: "CASE-013",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-013",
  transactionSeed: "demo-tx-013",
  sequence: 13,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_013 = typeof DEMO_CASE_013;

export function assertDemoCase_013(): true {
  if (!DEMO_CASE_013.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_013.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
