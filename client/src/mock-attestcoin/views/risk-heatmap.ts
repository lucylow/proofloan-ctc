import type { MockDataset } from "../types";
import { selectPrimaryApplication, selectPrimaryWallet } from "../selectors";
import { buildJudgeSummary, buildHealthSummary, crossChainScore, freshnessBreakdown, transactionStats, attestationStats, riskPresentation, PROTOCOL_STAGES } from "../presentation";
import { captureReplaySnapshot, replayFingerprint } from "../replay";
import { searchApplications, searchFacts, searchProofs, searchChains } from "../query";
import { summarizeMockAnalytics } from "../analytics";
import { listMockScenarios } from "../scenarios";

export function buildRiskHeatmapView(dataset: MockDataset) {
  const payload = dataset.decisions;
  return {
    title: "Risk heatmap",
    presentationOnly: true as const,
    scenario: dataset.scenario,
    seed: dataset.seed,
    payload,
    counts: {
      applications: dataset.applications.length,
      facts: dataset.facts.length,
      proofs: dataset.proofRequests.length,
    },
  };
}
