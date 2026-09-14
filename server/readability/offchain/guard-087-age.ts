// Generated operational guard 087: age.
export type GuardInput = { ageMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard087 {
  constructor(private readonly minimum = 23) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.ageMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"age must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`age below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard087", subject:"ageMs", minimum:this.minimum, purpose:"age" };
  }
}

export function validateGuard087(value:number, minimum=23) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard087(value:number, minimum=23) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard087(value:number, minimum=23) {
  return value < minimum ? `age requires >= ${minimum}` : `age satisfies policy`;
}
