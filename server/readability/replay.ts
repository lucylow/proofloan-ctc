import { sha256 } from "./ids";

export class ReplayGuard {
  private readonly seen = new Set<string>();

  constructor(private readonly maxEntries = 50_000) {}

  key(input: {
    chainKey: number;
    blockHeight: number;
    transactionIndex: number;
    logIndex?: number;
    source: string;
  }): string {
    return sha256(
      `${input.chainKey}|${input.blockHeight}|${input.transactionIndex}|${input.logIndex ?? 0}|${input.source.toLowerCase()}`,
    );
  }

  claim(key: string): boolean {
    if (this.seen.has(key)) return false;
    if (this.seen.size >= this.maxEntries) {
      const first = this.seen.values().next().value;
      if (typeof first === "string") this.seen.delete(first);
    }
    this.seen.add(key);
    return true;
  }

  has(key: string): boolean {
    return this.seen.has(key);
  }

  reset(): void {
    this.seen.clear();
  }

  size(): number {
    return this.seen.size;
  }
}
