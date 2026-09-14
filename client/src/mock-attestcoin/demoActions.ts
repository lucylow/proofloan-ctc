import type { MockDataset, MockScenario } from "./types";
import { createMockDataset } from "./createMockDataset";

export type MockDemoAction =
  | { type: "reset"; seed?: string }
  | { type: "switch-scenario"; scenario: MockScenario }
  | { type: "mark-notification-read"; id: string }
  | { type: "inject-proof-delay" };

export function applyMockDemoAction(dataset: MockDataset, action: MockDemoAction): MockDataset {
  switch (action.type) {
    case "reset":
      return createMockDataset(dataset.scenario, action.seed ?? dataset.seed);
    case "switch-scenario":
      return createMockDataset(action.scenario, dataset.seed);
    case "mark-notification-read":
      return {
        ...dataset,
        notifications: dataset.notifications.map(item => item.id === action.id ? { ...item, read: true } : item),
      };
    case "inject-proof-delay":
      return createMockDataset("proof-delay", dataset.seed);
    default:
      return dataset;
  }
}
