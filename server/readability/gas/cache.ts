type CacheEntry<T> = { value: T; expiresAt: number };

export class GasEstimateCache<T> {
  private readonly map = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs = 15_000) {}

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()): void {
    this.map.set(key, { value, expiresAt: now + this.ttlMs });
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }
}
