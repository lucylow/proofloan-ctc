import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #029.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_029 = {
  caseId: "CASE-029",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-029",
  transactionSeed: "demo-tx-029",
  sequence: 29,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_029 = typeof DEMO_CASE_029;

export function assertDemoCase_029(): true {
  if (!DEMO_CASE_029.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_029.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
