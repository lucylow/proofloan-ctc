import type { MockDataset } from "../types";

export function freshnessBreakdown(dataset: MockDataset) {
  return {
    fresh: dataset.facts.filter(fact => fact.freshness === "Fresh").length,
    aging: dataset.facts.filter(fact => fact.freshness === "Aging").length,
    stale: dataset.facts.filter(fact => fact.freshness === "Stale").length,
  };
}
