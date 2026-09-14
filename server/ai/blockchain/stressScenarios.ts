export interface StressScenario {
  name: string;
  mutate: (features: Record<string, number>) => Record<string, number>;
}

export const BLOCKCHAIN_STRESS_SCENARIOS: StressScenario[] = [
  {
    name: "RPC_DEGRADED",
    mutate: features => ({
      ...features,
      freshnessScore: Math.max(0, (features.freshnessScore ?? 0) * 0.7),
    }),
  },
  {
    name: "ATTESTOR_QUORUM_REDUCED",
    mutate: features => ({
      ...features,
      proofCoverage: Math.max(0, (features.proofCoverage ?? 0) * 0.6),
    }),
  },
  {
    name: "ACTIVITY_SPIKE",
    mutate: features => ({
      ...features,
      anomalyScore: Math.min(1, (features.anomalyScore ?? 0) + 0.4),
    }),
  },
];
