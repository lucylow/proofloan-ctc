import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #078.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_078 = {
  caseId: "CASE-078",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-078",
  transactionSeed: "demo-tx-078",
  sequence: 78,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_078 = typeof DEMO_CASE_078;

export function assertDemoCase_078(): true {
  if (!DEMO_CASE_078.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_078.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
