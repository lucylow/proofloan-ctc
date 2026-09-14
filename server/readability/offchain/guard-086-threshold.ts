// Generated operational guard 086: threshold.
export type GuardInput = { threshold: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard086 {
  constructor(private readonly minimum = 22) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.threshold);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"threshold must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`threshold below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard086", subject:"threshold", minimum:this.minimum, purpose:"threshold" };
  }
}

export function validateGuard086(value:number, minimum=22) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard086(value:number, minimum=22) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard086(value:number, minimum=22) {
  return value < minimum ? `threshold requires >= ${minimum}` : `threshold satisfies policy`;
}
