import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #064.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_064 = {
  caseId: "CASE-064",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-064",
  transactionSeed: "demo-tx-064",
  sequence: 64,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_064 = typeof DEMO_CASE_064;

export function assertDemoCase_064(): true {
  if (!DEMO_CASE_064.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_064.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
