import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #020.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_020 = {
  caseId: "CASE-020",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-020",
  transactionSeed: "demo-tx-020",
  sequence: 20,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_020 = typeof DEMO_CASE_020;

export function assertDemoCase_020(): true {
  if (!DEMO_CASE_020.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_020.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
