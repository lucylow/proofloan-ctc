import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #022.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_022 = {
  caseId: "CASE-022",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-022",
  transactionSeed: "demo-tx-022",
  sequence: 22,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_022 = typeof DEMO_CASE_022;

export function assertDemoCase_022(): true {
  if (!DEMO_CASE_022.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_022.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
