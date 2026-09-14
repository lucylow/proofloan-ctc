import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #046.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_046 = {
  caseId: "CASE-046",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-046",
  transactionSeed: "demo-tx-046",
  sequence: 46,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_046 = typeof DEMO_CASE_046;

export function assertDemoCase_046(): true {
  if (!DEMO_CASE_046.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_046.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
