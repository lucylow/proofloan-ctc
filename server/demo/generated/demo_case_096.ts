import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #096.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_096 = {
  caseId: "CASE-096",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-096",
  transactionSeed: "demo-tx-096",
  sequence: 96,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_096 = typeof DEMO_CASE_096;

export function assertDemoCase_096(): true {
  if (!DEMO_CASE_096.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_096.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
