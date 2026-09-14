import { MOCK_FACT_LABELS } from "../factCatalog";
import type { MockDataset } from "../types";

export function factCategoryCounts(dataset: MockDataset) {
  return Object.fromEntries(
    Object.entries(MOCK_FACT_LABELS).map(([event]) => [
      event,
      dataset.facts.filter(fact => fact.eventType === event).length,
    ]),
  );
}
