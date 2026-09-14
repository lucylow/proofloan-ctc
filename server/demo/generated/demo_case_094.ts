import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #094.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_094 = {
  caseId: "CASE-094",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-094",
  transactionSeed: "demo-tx-094",
  sequence: 94,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_094 = typeof DEMO_CASE_094;

export function assertDemoCase_094(): true {
  if (!DEMO_CASE_094.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_094.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
