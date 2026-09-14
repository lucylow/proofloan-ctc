import { ProofLoanAppError } from "./appError";

export type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold = 3,
    private readonly resetAfterMs = 15_000,
  ) {}

  getState(): CircuitState {
    if (this.state === "open" && Date.now() - this.openedAt >= this.resetAfterMs) {
      this.state = "half-open";
    }
    return this.state;
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();
    if (state === "open") {
      throw new ProofLoanAppError({
        code: "SERVICE_CIRCUIT_OPEN",
        message: "Dependency temporarily disabled after repeated failures",
        source: "network",
        retryable: true,
      });
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private recordFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }
}
