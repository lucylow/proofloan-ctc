// Generated operational guard 007: lease duration.
export type GuardInput = { leaseMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard007 {
  constructor(private readonly minimum = 9) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.leaseMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"lease duration must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`lease duration below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard007", subject:"leaseMs", minimum:this.minimum, purpose:"lease duration" };
  }
}

export function validateGuard007(value:number, minimum=9) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard007(value:number, minimum=9) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard007(value:number, minimum=9) {
  return value < minimum ? `lease duration requires >= ${minimum}` : `lease duration satisfies policy`;
}
