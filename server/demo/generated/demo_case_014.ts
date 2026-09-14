import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #014.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_014 = {
  caseId: "CASE-014",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-014",
  transactionSeed: "demo-tx-014",
  sequence: 14,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_014 = typeof DEMO_CASE_014;

export function assertDemoCase_014(): true {
  if (!DEMO_CASE_014.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_014.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
