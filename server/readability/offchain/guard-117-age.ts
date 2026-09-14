// Generated operational guard 117: age.
export type GuardInput = { ageMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard117 {
  constructor(private readonly minimum = 30) {}
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
    return { name:"Guard117", subject:"ageMs", minimum:this.minimum, purpose:"age" };
  }
}

export function validateGuard117(value:number, minimum=30) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard117(value:number, minimum=30) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard117(value:number, minimum=30) {
  return value < minimum ? `age requires >= ${minimum}` : `age satisfies policy`;
}
