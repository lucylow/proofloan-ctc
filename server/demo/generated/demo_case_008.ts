import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #008.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_008 = {
  caseId: "CASE-008",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-008",
  transactionSeed: "demo-tx-008",
  sequence: 8,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_008 = typeof DEMO_CASE_008;

export function assertDemoCase_008(): true {
  if (!DEMO_CASE_008.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_008.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
