import type { ProofEnvelope } from "./types";

export class ProofCache {
  private readonly entries = new Map<string, { expiresAt: number; envelope: ProofEnvelope }>();

  constructor(private readonly ttlMs = 300_000) {}

  get(key: string, now = Date.now()): ProofEnvelope | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.envelope;
  }

  set(key: string, envelope: ProofEnvelope, now = Date.now()): void {
    this.entries.set(key, { expiresAt: now + this.ttlMs, envelope });
  }

  size(): number {
    return this.entries.size;
  }
}
