export type CircuitState = "closed" | "open" | "half-open";
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;
  private probeInFlight = false;
  constructor(private readonly threshold = 5, private readonly resetMs = 30_000, private readonly clock = () => Date.now()) {}
  getState() { return this.state; }
  canRequest() {
    if (this.state === "closed") return true;
    if (this.state === "open" && this.clock() - this.openedAt >= this.resetMs && !this.probeInFlight) {
      this.state = "half-open"; this.probeInFlight = true; return true;
    }
    return this.state === "half-open" && !this.probeInFlight;
  }
  success() { this.failures = 0; this.state = "closed"; this.probeInFlight = false; }
  failure() {
    this.failures += 1;
    this.probeInFlight = false;
    if (this.failures >= this.threshold) { this.state = "open"; this.openedAt = this.clock(); }
  }
}
