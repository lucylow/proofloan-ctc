import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #118.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_118 = {
  caseId: "CASE-118",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-118",
  transactionSeed: "demo-tx-118",
  sequence: 118,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_118 = typeof DEMO_CASE_118;

export function assertDemoCase_118(): true {
  if (!DEMO_CASE_118.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_118.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
