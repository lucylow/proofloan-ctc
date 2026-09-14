import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #110.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_110 = {
  caseId: "CASE-110",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-110",
  transactionSeed: "demo-tx-110",
  sequence: 110,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_110 = typeof DEMO_CASE_110;

export function assertDemoCase_110(): true {
  if (!DEMO_CASE_110.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_110.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
