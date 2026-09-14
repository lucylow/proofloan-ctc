export interface Clock {
  now(): number;
  nowIso(): string;
}

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
  nowIso(): string {
    return new Date(this.now()).toISOString();
  }
}

export class FixedClock implements Clock {
  constructor(private epochMs: number) {}
  now(): number {
    return this.epochMs;
  }
  nowIso(): string {
    return new Date(this.epochMs).toISOString();
  }
  advance(ms: number): void {
    if (!Number.isFinite(ms)) throw new Error("invalid clock advance");
    this.epochMs += Math.max(0, Math.floor(ms));
  }
  reset(epochMs: number): void {
    if (!Number.isFinite(epochMs)) throw new Error("invalid clock reset");
    this.epochMs = epochMs;
  }
}
