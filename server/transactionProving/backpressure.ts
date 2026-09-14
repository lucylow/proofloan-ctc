import { TransactionProvingError } from "./errors";

export class BackpressureGate {
  private inFlight = 0;

  constructor(private readonly limit: number) {}

  tryAcquire(): boolean {
    if (this.inFlight >= this.limit) return false;
    this.inFlight++;
    return true;
  }

  acquire(): void {
    if (!this.tryAcquire()) {
      throw new TransactionProvingError("BACKPRESSURE", "PROOF_BACKPRESSURE", true);
    }
  }

  release(): void {
    this.inFlight = Math.max(0, this.inFlight - 1);
  }

  get inFlightCount(): number {
    return this.inFlight;
  }
}
