import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #088.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_088 = {
  caseId: "CASE-088",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-088",
  transactionSeed: "demo-tx-088",
  sequence: 88,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_088 = typeof DEMO_CASE_088;

export function assertDemoCase_088(): true {
  if (!DEMO_CASE_088.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_088.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
