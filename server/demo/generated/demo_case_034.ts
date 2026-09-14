import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #034.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_034 = {
  caseId: "CASE-034",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-034",
  transactionSeed: "demo-tx-034",
  sequence: 34,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_034 = typeof DEMO_CASE_034;

export function assertDemoCase_034(): true {
  if (!DEMO_CASE_034.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_034.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
