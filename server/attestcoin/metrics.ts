import type { AttestcoinMetrics } from "@shared/attestcoin";

export class AttestcoinMetricsStore {
  private state: AttestcoinMetrics = {
    requests: 0,
    successes: 0,
    failures: 0,
    cacheHits: 0,
    previewFallbacks: 0,
    retries: 0,
    averageLatencyMs: 0,
  };

  recordRequest() {
    this.state.requests += 1;
  }

  recordSuccess(latencyMs: number) {
    this.state.successes += 1;
    this.state.averageLatencyMs =
      this.state.averageLatencyMs === 0
        ? latencyMs
        : (this.state.averageLatencyMs * (this.state.successes - 1) +
            latencyMs) /
          this.state.successes;
  }

  recordFailure() {
    this.state.failures += 1;
  }

  recordCacheHit() {
    this.state.cacheHits += 1;
  }

  recordPreviewFallback() {
    this.state.previewFallbacks += 1;
  }

  recordRetry() {
    this.state.retries += 1;
  }

  snapshot(): AttestcoinMetrics {
    return { ...this.state };
  }
}
