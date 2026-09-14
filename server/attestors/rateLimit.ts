export class AttestorRateLimiter {
  private readonly windows = new Map<string, number[]>();
  constructor(private readonly limit = 100, private readonly windowMs = 60_000) {}
  allow(operatorId: string, now = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const current = (this.windows.get(operatorId) ?? []).filter(t => t > cutoff);
    if (current.length >= this.limit) { this.windows.set(operatorId, current); return false; }
    current.push(now);
    this.windows.set(operatorId, current);
    return true;
  }
}
