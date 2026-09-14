// Generated operational guard 047: height.
export type GuardInput = { height: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard047 {
  constructor(private readonly minimum = 16) {}
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
    return { name:"Guard047", subject:"height", minimum:this.minimum, purpose:"height" };
  }
}

export function validateGuard047(value:number, minimum=16) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard047(value:number, minimum=16) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard047(value:number, minimum=16) {
  return value < minimum ? `height requires >= ${minimum}` : `height satisfies policy`;
}
