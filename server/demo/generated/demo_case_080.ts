import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #080.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_080 = {
  caseId: "CASE-080",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-080",
  transactionSeed: "demo-tx-080",
  sequence: 80,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_080 = typeof DEMO_CASE_080;

export function assertDemoCase_080(): true {
  if (!DEMO_CASE_080.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_080.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
