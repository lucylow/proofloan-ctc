export type CacheEntry<T> = { value: T; expiresAt: number };

export class AttestorCache<T> {
  private readonly items = new Map<string, CacheEntry<T>>();
  constructor(private readonly maxEntries = 500) {}

  set(key: string, value: T, ttlMs: number): void {
    if (this.items.size >= this.maxEntries && !this.items.has(key)) {
      const oldest = this.items.keys().next().value;
      if (typeof oldest === "string") this.items.delete(oldest);
    }
    this.items.set(key, { value: structuredClone(value), expiresAt: Date.now() + Math.max(1, ttlMs) });
  }

  get(key: string): T | undefined {
    const entry = this.items.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.items.delete(key);
      return undefined;
    }
    return structuredClone(entry.value);
  }

  delete(key: string): boolean { return this.items.delete(key); }
  clear(): void { this.items.clear(); }
  size(): number { return this.items.size; }
}
