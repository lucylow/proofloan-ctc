export type CacheEntry<T> = {
  value: T;
  createdAt: number;
  expiresAt: number;
};

export class TtlCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs: number, now = Date.now()) {
    this.entries.set(key, {
      value,
      createdAt: now,
      expiresAt: now + Math.max(0, ttlMs),
    });
  }

  delete(key: string) {
    return this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }

  size() {
    return this.entries.size;
  }
}
