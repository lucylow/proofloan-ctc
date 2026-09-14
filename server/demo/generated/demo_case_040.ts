import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #040.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_040 = {
  caseId: "CASE-040",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-040",
  transactionSeed: "demo-tx-040",
  sequence: 40,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_040 = typeof DEMO_CASE_040;

export function assertDemoCase_040(): true {
  if (!DEMO_CASE_040.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_040.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
