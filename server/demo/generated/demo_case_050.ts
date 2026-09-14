import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #050.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_050 = {
  caseId: "CASE-050",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-050",
  transactionSeed: "demo-tx-050",
  sequence: 50,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_050 = typeof DEMO_CASE_050;

export function assertDemoCase_050(): true {
  if (!DEMO_CASE_050.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_050.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
