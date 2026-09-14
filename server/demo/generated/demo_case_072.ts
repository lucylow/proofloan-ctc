import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #072.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_072 = {
  caseId: "CASE-072",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-072",
  transactionSeed: "demo-tx-072",
  sequence: 72,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_072 = typeof DEMO_CASE_072;

export function assertDemoCase_072(): true {
  if (!DEMO_CASE_072.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_072.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
