import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #056.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_056 = {
  caseId: "CASE-056",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-056",
  transactionSeed: "demo-tx-056",
  sequence: 56,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_056 = typeof DEMO_CASE_056;

export function assertDemoCase_056(): true {
  if (!DEMO_CASE_056.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_056.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
