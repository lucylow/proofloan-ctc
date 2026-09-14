import { AttestcoinError } from "./errors";

export type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold = 3,
    private readonly cooldownMs = 30_000,
  ) {}

  getState(now = Date.now()): CircuitState {
    if (
      this.state === "open" &&
      now - this.openedAt >= this.cooldownMs
    ) {
      this.state = "half-open";
    }

    return this.state;
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === "open") {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        "Attestcoin circuit is open.",
        { retriable: true },
      );
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

  diagnostics() {
    return {
      state: this.getState(),
      failures: this.failures,
      openedAt: this.openedAt || null,
    };
  }
}
