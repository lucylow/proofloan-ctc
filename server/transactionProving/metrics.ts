export interface ProvingMetrics {
  requests: number;
  generated: number;
  verified: number;
  failed: number;
  rejected: number;
  avgCostCtc: number;
  avgContinuityHashes: number;
}

export class MetricsAccumulator {
  private data: ProvingMetrics = {
    requests: 0,
    generated: 0,
    verified: 0,
    failed: 0,
    rejected: 0,
    avgCostCtc: 0,
    avgContinuityHashes: 0,
  };

  observe(status: "generated" | "verified" | "failed" | "rejected", cost = 0, hashes = 0): void {
    this.data.requests++;
    this.data[status]++;
    this.data.avgCostCtc += (cost - this.data.avgCostCtc) / this.data.requests;
    this.data.avgContinuityHashes += (hashes - this.data.avgContinuityHashes) / this.data.requests;
  }

  snapshot(): ProvingMetrics {
    return { ...this.data };
  }

  reset(): void {
    this.data = {
      requests: 0,
      generated: 0,
      verified: 0,
      failed: 0,
      rejected: 0,
      avgCostCtc: 0,
      avgContinuityHashes: 0,
    };
  }
}
