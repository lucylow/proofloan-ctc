export class ProofDedupe {
  private readonly seen = new Map<string, number>();

  constructor(private readonly ttlMs = 86_400_000) {}

  key(chainKey: number, txHash: string): string {
    return `${chainKey}:${txHash.toLowerCase()}`;
  }

  has(key: string, now = Date.now()): boolean {
    const ts = this.seen.get(key);
    if (ts === undefined) return false;
    if (now - ts > this.ttlMs) {
      this.seen.delete(key);
      return false;
    }
    return true;
  }

  mark(key: string, now = Date.now()): void {
    this.seen.set(key, now);
  }

  reset(): void {
    this.seen.clear();
  }
}
