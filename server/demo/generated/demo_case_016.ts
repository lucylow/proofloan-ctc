import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #016.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_016 = {
  caseId: "CASE-016",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-016",
  transactionSeed: "demo-tx-016",
  sequence: 16,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_016 = typeof DEMO_CASE_016;

export function assertDemoCase_016(): true {
  if (!DEMO_CASE_016.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_016.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
