// Generated operational guard 022: capacity.
export type GuardInput = { capacity: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard022 {
  constructor(private readonly minimum = 9) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.capacity);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"capacity must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`capacity below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard022", subject:"capacity", minimum:this.minimum, purpose:"capacity" };
  }
}

export function validateGuard022(value:number, minimum=9) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard022(value:number, minimum=9) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard022(value:number, minimum=9) {
  return value < minimum ? `capacity requires >= ${minimum}` : `capacity satisfies policy`;
}
