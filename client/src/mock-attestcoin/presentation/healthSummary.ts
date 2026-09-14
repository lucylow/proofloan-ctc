import type { MockDataset } from "../types";

export function buildHealthSummary(dataset: MockDataset) {
  return {
    presentationOnly: true as const,
    ...dataset.health,
    degraded: [dataset.health.creditcoinRpc, dataset.health.proofBuilder, dataset.health.sourceRpc].some(status => status !== "healthy"),
  };
}
