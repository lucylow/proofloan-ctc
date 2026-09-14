import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #006.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_006 = {
  caseId: "CASE-006",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-006",
  transactionSeed: "demo-tx-006",
  sequence: 6,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_006 = typeof DEMO_CASE_006;

export function assertDemoCase_006(): true {
  if (!DEMO_CASE_006.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_006.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
