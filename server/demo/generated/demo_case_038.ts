import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #038.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_038 = {
  caseId: "CASE-038",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-038",
  transactionSeed: "demo-tx-038",
  sequence: 38,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_038 = typeof DEMO_CASE_038;

export function assertDemoCase_038(): true {
  if (!DEMO_CASE_038.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_038.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
