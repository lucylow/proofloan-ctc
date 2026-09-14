import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #102.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_102 = {
  caseId: "CASE-102",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-102",
  transactionSeed: "demo-tx-102",
  sequence: 102,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_102 = typeof DEMO_CASE_102;

export function assertDemoCase_102(): true {
  if (!DEMO_CASE_102.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_102.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
