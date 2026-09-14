import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #112.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_112 = {
  caseId: "CASE-112",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-112",
  transactionSeed: "demo-tx-112",
  sequence: 112,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_112 = typeof DEMO_CASE_112;

export function assertDemoCase_112(): true {
  if (!DEMO_CASE_112.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_112.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}
