// Generated operational guard 120: grace period.
export type GuardInput = { graceMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard120 {
  constructor(private readonly minimum = 28) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.graceMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"grace period must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`grace period below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard120", subject:"graceMs", minimum:this.minimum, purpose:"grace period" };
  }
}

export function validateGuard120(value:number, minimum=28) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard120(value:number, minimum=28) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard120(value:number, minimum=28) {
  return value < minimum ? `grace period requires >= ${minimum}` : `grace period satisfies policy`;
}
