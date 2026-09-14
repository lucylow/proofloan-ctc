// Generated operational guard 057: age.
export type GuardInput = { ageMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard057 {
  constructor(private readonly minimum = 16) {}
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
    return { name:"Guard057", subject:"ageMs", minimum:this.minimum, purpose:"age" };
  }
}

export function validateGuard057(value:number, minimum=16) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard057(value:number, minimum=16) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard057(value:number, minimum=16) {
  return value < minimum ? `age requires >= ${minimum}` : `age satisfies policy`;
}
