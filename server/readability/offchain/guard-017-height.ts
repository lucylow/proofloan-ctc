// Generated operational guard 017: height.
export type GuardInput = { height: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard017 {
  constructor(private readonly minimum = 9) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.height);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"height must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`height below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard017", subject:"height", minimum:this.minimum, purpose:"height" };
  }
}

export function validateGuard017(value:number, minimum=9) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard017(value:number, minimum=9) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard017(value:number, minimum=9) {
  return value < minimum ? `height requires >= ${minimum}` : `height satisfies policy`;
}
