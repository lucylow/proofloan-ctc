import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #063.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_063 = {
  caseId: "CASE-063",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-063",
  transactionSeed: "demo-tx-063",
  sequence: 63,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_063 = typeof DEMO_CASE_063;

export function assertDemoCase_063(): true {
  if (!DEMO_CASE_063.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_063.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
