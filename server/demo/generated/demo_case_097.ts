import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #097.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_097 = {
  caseId: "CASE-097",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-097",
  transactionSeed: "demo-tx-097",
  sequence: 97,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_097 = typeof DEMO_CASE_097;

export function assertDemoCase_097(): true {
  if (!DEMO_CASE_097.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_097.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
