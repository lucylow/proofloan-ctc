export class TokenBucket {
  private tokens: number;
  private updatedAt: number;
  constructor(private readonly capacity: number, private readonly refillPerSecond: number, private readonly clock = () => Date.now()) {
    this.tokens = capacity; this.updatedAt = this.clock();
  }
  private refill() {
    const now = this.clock();
    const elapsed = Math.max(0, now - this.updatedAt) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSecond);
    this.updatedAt = now;
  }
  tryTake(amount = 1): boolean {
    this.refill();
    if (this.tokens < amount) return false;
    this.tokens -= amount; return true;
  }
  remaining() { this.refill(); return this.tokens; }
}
