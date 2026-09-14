// Generated operational guard 074: weight.
export type GuardInput = { weight: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard074 {
  constructor(private readonly minimum = 25) {}
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
    return { name:"Guard074", subject:"weight", minimum:this.minimum, purpose:"weight" };
  }
}

export function validateGuard074(value:number, minimum=25) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard074(value:number, minimum=25) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard074(value:number, minimum=25) {
  return value < minimum ? `weight requires >= ${minimum}` : `weight satisfies policy`;
}
