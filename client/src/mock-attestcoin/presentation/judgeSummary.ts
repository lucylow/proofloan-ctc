import type { MockDataset } from "../types";
import { selectPrimaryApplication, selectVerifiedFactCount, selectPreviewFactCount, selectChainCoverage } from "../selectors";

export function buildJudgeSummary(dataset: MockDataset) {
  const application = selectPrimaryApplication(dataset);
  return {
    presentationOnly: true as const,
    scenario: dataset.scenario,
    applicationId: application?.id ?? null,
    verifiedFacts: selectVerifiedFactCount(dataset),
    previewFacts: selectPreviewFactCount(dataset),
    chains: selectChainCoverage(dataset),
    health: dataset.health,
    trustPath: [
      "Source-chain transaction",
      "Attestcoin ProofBuilder",
      "Attestation availability",
      "Merkle + continuity proof",
      "Creditcoin Block Prover",
      "Verified fact",
      "Evidence root",
      "Underwriting",
      "RiskGuard",
    ],
    note: "This dataset is presentation-only. Live proofs still require Creditcoin verification.",
  };
}
