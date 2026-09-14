// Generated operational guard 105: epoch.
export type GuardInput = { epoch: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard105 {
  constructor(private readonly minimum = 28) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.epoch);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"epoch must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`epoch below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard105", subject:"epoch", minimum:this.minimum, purpose:"epoch" };
  }
}

export function validateGuard105(value:number, minimum=28) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard105(value:number, minimum=28) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard105(value:number, minimum=28) {
  return value < minimum ? `epoch requires >= ${minimum}` : `epoch satisfies policy`;
}
