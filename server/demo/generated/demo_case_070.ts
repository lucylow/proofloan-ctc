import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #070.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_070 = {
  caseId: "CASE-070",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-070",
  transactionSeed: "demo-tx-070",
  sequence: 70,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_070 = typeof DEMO_CASE_070;

export function assertDemoCase_070(): true {
  if (!DEMO_CASE_070.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_070.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
