import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #017.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_017 = {
  caseId: "CASE-017",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-017",
  transactionSeed: "demo-tx-017",
  sequence: 17,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_017 = typeof DEMO_CASE_017;

export function assertDemoCase_017(): true {
  if (!DEMO_CASE_017.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_017.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
