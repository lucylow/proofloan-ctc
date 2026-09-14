// Generated operational guard 088: interval.
export type GuardInput = { intervalMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard088 {
  constructor(private readonly minimum = 24) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.intervalMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"interval must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`interval below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard088", subject:"intervalMs", minimum:this.minimum, purpose:"interval" };
  }
}

export function validateGuard088(value:number, minimum=24) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard088(value:number, minimum=24) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard088(value:number, minimum=24) {
  return value < minimum ? `interval requires >= ${minimum}` : `interval satisfies policy`;
}
