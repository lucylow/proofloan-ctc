import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #061.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_061 = {
  caseId: "CASE-061",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-061",
  transactionSeed: "demo-tx-061",
  sequence: 61,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_061 = typeof DEMO_CASE_061;

export function assertDemoCase_061(): true {
  if (!DEMO_CASE_061.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_061.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
