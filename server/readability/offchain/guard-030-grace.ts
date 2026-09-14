// Generated operational guard 030: grace period.
export type GuardInput = { graceMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard030 {
  constructor(private readonly minimum = 7) {}
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
    return { name:"Guard030", subject:"graceMs", minimum:this.minimum, purpose:"grace period" };
  }
}

export function validateGuard030(value:number, minimum=7) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard030(value:number, minimum=7) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard030(value:number, minimum=7) {
  return value < minimum ? `grace period requires >= ${minimum}` : `grace period satisfies policy`;
}
