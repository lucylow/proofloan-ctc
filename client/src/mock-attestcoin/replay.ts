import type { MockDataset } from "./types";

export type MockReplaySnapshot = {
  capturedAt: string;
  scenario: MockDataset["scenario"];
  seed: string;
  applicationCount: number;
  factCount: number;
  proofCount: number;
};

export function captureReplaySnapshot(dataset: MockDataset): MockReplaySnapshot {
  return {
    capturedAt: dataset.generatedAt,
    scenario: dataset.scenario,
    seed: dataset.seed,
    applicationCount: dataset.applications.length,
    factCount: dataset.facts.length,
    proofCount: dataset.proofRequests.length,
  };
}

export function replayFingerprint(snapshot: MockReplaySnapshot) {
  return `${snapshot.scenario}:${snapshot.seed}:${snapshot.applicationCount}:${snapshot.factCount}`;
}
