export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(private readonly defaultTtlMs = 30_000) {}

  set(key: string, value: T, ttlMs = this.defaultTtlMs) {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  delete(key: string) {
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}
