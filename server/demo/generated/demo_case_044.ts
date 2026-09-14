import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #044.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_044 = {
  caseId: "CASE-044",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-044",
  transactionSeed: "demo-tx-044",
  sequence: 44,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_044 = typeof DEMO_CASE_044;

export function assertDemoCase_044(): true {
  if (!DEMO_CASE_044.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_044.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
