export type MaturityPolicy = {
  maturityDelaySeconds: number;
  maxFutureSkewSeconds: number;
  minObservationAgeSeconds: number;
};

export const defaultMaturityPolicy: MaturityPolicy = {
  maturityDelaySeconds: 120,
  maxFutureSkewSeconds: 30,
  minObservationAgeSeconds: 0,
};

export function isMature(observedAt: string, maturityAt: string, now = Date.now(), policy = defaultMaturityPolicy): boolean {
  const observedMs = Date.parse(observedAt);
  const maturityMs = Date.parse(maturityAt);
  if (!Number.isFinite(observedMs) || !Number.isFinite(maturityMs)) return false;
  if (observedMs - now > policy.maxFutureSkewSeconds * 1000) return false;
  if (now - observedMs < policy.minObservationAgeSeconds * 1000) return false;
  return maturityMs <= now;
}

export function computeMaturityAt(observedAt: string, policy = defaultMaturityPolicy): string {
  const observedMs = Date.parse(observedAt);
  if (!Number.isFinite(observedMs)) throw new Error("Invalid observedAt timestamp.");
  return new Date(observedMs + policy.maturityDelaySeconds * 1000).toISOString();
}

export function finalizeObservation<T extends { maturityAt: string; finalized: boolean }>(observation: T, now = new Date()): T {
  return { ...observation, finalized: Date.parse(observation.maturityAt) <= now.getTime() } as T;
}
