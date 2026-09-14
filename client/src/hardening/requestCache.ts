import { TtlCache } from "./memoryCache";

export class RequestCache<T> {
  private readonly cache: TtlCache<T>;

  constructor(ttlMs = 5000) {
    this.cache = new TtlCache<T>(ttlMs);
  }

  async getOrRun(key: string, operation: () => Promise<T>) {
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const value = await operation();
    this.cache.set(key, value);
    return value;
  }

  clear(key?: string) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }
}
