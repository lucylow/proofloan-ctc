import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #109.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_109 = {
  caseId: "CASE-109",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-109",
  transactionSeed: "demo-tx-109",
  sequence: 109,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_109 = typeof DEMO_CASE_109;

export function assertDemoCase_109(): true {
  if (!DEMO_CASE_109.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_109.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
