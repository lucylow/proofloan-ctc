// Generated operational guard 005: range.
export type GuardInput = { range: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard005 {
  constructor(private readonly minimum = 7) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.range);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"range must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`range below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard005", subject:"range", minimum:this.minimum, purpose:"range" };
  }
}

export function validateGuard005(value:number, minimum=7) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard005(value:number, minimum=7) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard005(value:number, minimum=7) {
  return value < minimum ? `range requires >= ${minimum}` : `range satisfies policy`;
}
