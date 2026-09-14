import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #027.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_027 = {
  caseId: "CASE-027",
  profileId: "high-risk-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-027",
  transactionSeed: "demo-tx-027",
  sequence: 27,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_027 = typeof DEMO_CASE_027;

export function assertDemoCase_027(): true {
  if (!DEMO_CASE_027.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_027.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
