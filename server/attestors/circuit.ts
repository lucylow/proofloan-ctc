export type CircuitState = "closed" | "open" | "half-open";
export class AttestorCircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private readonly failureThreshold = 5, private readonly recoveryMs = 30_000) {}
  allow(now = Date.now()): boolean { if (this.state === "closed") return true; if (this.state === "open" && now - this.openedAt >= this.recoveryMs) { this.state = "half-open"; return true; } return this.state === "half-open"; }
  success(): void { this.failures = 0; this.state = "closed"; }
  failure(now = Date.now()): void { this.failures += 1; if (this.failures >= this.failureThreshold) { this.state = "open"; this.openedAt = now; } }
  snapshot() { return { state: this.state, failures: this.failures, openedAt: this.openedAt }; }
}
