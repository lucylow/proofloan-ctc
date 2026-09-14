import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #024.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_024 = {
  caseId: "CASE-024",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-024",
  transactionSeed: "demo-tx-024",
  sequence: 24,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_024 = typeof DEMO_CASE_024;

export function assertDemoCase_024(): true {
  if (!DEMO_CASE_024.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_024.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
