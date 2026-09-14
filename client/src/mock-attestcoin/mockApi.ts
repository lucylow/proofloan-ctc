import { createMockDataset } from "./createMockDataset";
import type { MockDataset, MockScenario } from "./types";

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function mockFetchDataset(scenario: MockScenario): Promise<MockDataset> {
  await wait(12);
  return createMockDataset(scenario);
}

export async function mockFetchApplication(dataset: MockDataset, applicationId: string) {
  await wait(8);
  return dataset.applications.find(item => item.id === applicationId) ?? null;
}
