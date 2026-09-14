export type GasMetrics = {
  estimates: number;
  rejected: number;
  delayed: number;
  submitted: number;
  estimatedCtc: number;
};

export class GasMetricsCollector {
  private metrics: GasMetrics = {
    estimates: 0,
    rejected: 0,
    delayed: 0,
    submitted: 0,
    estimatedCtc: 0,
  };

  recordEstimate(ctc: number): void {
    this.metrics.estimates += 1;
    this.metrics.estimatedCtc += ctc;
  }

  recordRejected(): void {
    this.metrics.rejected += 1;
  }

  recordDelayed(): void {
    this.metrics.delayed += 1;
  }

  recordSubmitted(): void {
    this.metrics.submitted += 1;
  }

  snapshot(): GasMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      estimates: 0,
      rejected: 0,
      delayed: 0,
      submitted: 0,
      estimatedCtc: 0,
    };
  }
}
