import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #052.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_052 = {
  caseId: "CASE-052",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-052",
  transactionSeed: "demo-tx-052",
  sequence: 52,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_052 = typeof DEMO_CASE_052;

export function assertDemoCase_052(): true {
  if (!DEMO_CASE_052.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_052.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
