// Generated operational guard 021: ttl.
export type GuardInput = { ttlMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard021 {
  constructor(private readonly minimum = 8) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.ttlMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"ttl must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`ttl below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard021", subject:"ttlMs", minimum:this.minimum, purpose:"ttl" };
  }
}

export function validateGuard021(value:number, minimum=8) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard021(value:number, minimum=8) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard021(value:number, minimum=8) {
  return value < minimum ? `ttl requires >= ${minimum}` : `ttl satisfies policy`;
}
