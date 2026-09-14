export class MessageDeduper {
  private readonly seen = new Map<string, number>();
  constructor(private readonly ttlMs = 86_400_000, private readonly maxEntries = 100_000) {}
  seenBefore(key: string, now = Date.now()): boolean {
    this.cleanup(now);
    if (this.seen.has(key)) return true;
    if (this.seen.size >= this.maxEntries) {
      const first = this.seen.keys().next().value;
      if (typeof first === "string") this.seen.delete(first);
    }
    this.seen.set(key, now);
    return false;
  }
  cleanup(now = Date.now()): void { for (const [key, at] of this.seen) if (now - at > this.ttlMs) this.seen.delete(key); }
  size(): number { return this.seen.size; }
}
