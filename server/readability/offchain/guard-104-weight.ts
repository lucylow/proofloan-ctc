// Generated operational guard 104: weight.
export type GuardInput = { weight: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard104 {
  constructor(private readonly minimum = 32) {}
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
    return { name:"Guard104", subject:"weight", minimum:this.minimum, purpose:"weight" };
  }
}

export function validateGuard104(value:number, minimum=32) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard104(value:number, minimum=32) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard104(value:number, minimum=32) {
  return value < minimum ? `weight requires >= ${minimum}` : `weight satisfies policy`;
}
