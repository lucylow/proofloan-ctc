import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #048.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_048 = {
  caseId: "CASE-048",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-048",
  transactionSeed: "demo-tx-048",
  sequence: 48,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_048 = typeof DEMO_CASE_048;

export function assertDemoCase_048(): true {
  if (!DEMO_CASE_048.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_048.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
