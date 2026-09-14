export interface ProviderHealth {
  healthy: boolean;
  latencyMs: number;
  lastError?: string;
}

export function healthy(h: ProviderHealth): boolean {
  return h.healthy && h.latencyMs < 5_000;
}
