// Generated operational guard 111: ttl.
export type GuardInput = { ttlMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard111 {
  constructor(private readonly minimum = 29) {}
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
    return { name:"Guard111", subject:"ttlMs", minimum:this.minimum, purpose:"ttl" };
  }
}

export function validateGuard111(value:number, minimum=29) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard111(value:number, minimum=29) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard111(value:number, minimum=29) {
  return value < minimum ? `ttl requires >= ${minimum}` : `ttl satisfies policy`;
}
