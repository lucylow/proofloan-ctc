import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #085.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_085 = {
  caseId: "CASE-085",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-085",
  transactionSeed: "demo-tx-085",
  sequence: 85,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_085 = typeof DEMO_CASE_085;

export function assertDemoCase_085(): true {
  if (!DEMO_CASE_085.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_085.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
