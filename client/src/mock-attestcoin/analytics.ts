import type { MockDataset } from "./types";

export function summarizeMockAnalytics(dataset: MockDataset) {
  return {
    presentationOnly: true as const,
    ...dataset.analytics,
    health: dataset.health,
  };
}
