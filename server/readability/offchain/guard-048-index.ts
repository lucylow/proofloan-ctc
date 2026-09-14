// Generated operational guard 048: index.
export type GuardInput = { index: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard048 {
  constructor(private readonly minimum = 17) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.index);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"index must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`index below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard048", subject:"index", minimum:this.minimum, purpose:"index" };
  }
}

export function validateGuard048(value:number, minimum=17) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard048(value:number, minimum=17) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard048(value:number, minimum=17) {
  return value < minimum ? `index requires >= ${minimum}` : `index satisfies policy`;
}
