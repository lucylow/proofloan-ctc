import type { AiDecisionEnvelope } from "./aiTypes";
import { AI_CACHE_TTL_MS } from "./constants";

export class AiDecisionCache {
  private readonly map = new Map<string, { value: AiDecisionEnvelope; expiresAt: number }>();
  constructor(private readonly maxEntries = 500) {}
  get(key: string, now = Date.now()): AiDecisionEnvelope | undefined {
    if (typeof key !== "string" || key.length === 0) return undefined;
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (!Number.isFinite(now) || hit.expiresAt <= now) {
      this.map.delete(key);
      return undefined;
    }
    return hit.value;
  }
  set(key: string, value: AiDecisionEnvelope, ttlMs = AI_CACHE_TTL_MS, now = Date.now()): void {
    if (typeof key !== "string" || key.length === 0 || !value) return;
    const boundedTtl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : AI_CACHE_TTL_MS;
    const safeNow = Number.isFinite(now) ? now : Date.now();
    if (!this.map.has(key) && this.map.size >= this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (typeof oldestKey === "string") this.map.delete(oldestKey);
    }
    this.map.set(key, { value, expiresAt: safeNow + boundedTtl });
  }
  clear(): void { this.map.clear(); }
  size(): number { return this.map.size; }
}
