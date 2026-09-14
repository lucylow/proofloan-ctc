import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #086.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_086 = {
  caseId: "CASE-086",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-086",
  transactionSeed: "demo-tx-086",
  sequence: 86,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_086 = typeof DEMO_CASE_086;

export function assertDemoCase_086(): true {
  if (!DEMO_CASE_086.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_086.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
