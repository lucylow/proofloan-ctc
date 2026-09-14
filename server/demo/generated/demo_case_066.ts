import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #066.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_066 = {
  caseId: "CASE-066",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-066",
  transactionSeed: "demo-tx-066",
  sequence: 66,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_066 = typeof DEMO_CASE_066;

export function assertDemoCase_066(): true {
  if (!DEMO_CASE_066.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_066.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
