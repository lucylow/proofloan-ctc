// Generated operational guard 044: weight.
export type GuardInput = { weight: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard044 {
  constructor(private readonly minimum = 18) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.weight);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"weight must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`weight below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard044", subject:"weight", minimum:this.minimum, purpose:"weight" };
  }
}

export function validateGuard044(value:number, minimum=18) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard044(value:number, minimum=18) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard044(value:number, minimum=18) {
  return value < minimum ? `weight requires >= ${minimum}` : `weight satisfies policy`;
}
