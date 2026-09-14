// Generated operational guard 060: grace period.
export type GuardInput = { graceMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard060 {
  constructor(private readonly minimum = 14) {}
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
    return { name:"Guard060", subject:"graceMs", minimum:this.minimum, purpose:"grace period" };
  }
}

export function validateGuard060(value:number, minimum=14) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard060(value:number, minimum=14) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard060(value:number, minimum=14) {
  return value < minimum ? `grace period requires >= ${minimum}` : `grace period satisfies policy`;
}
