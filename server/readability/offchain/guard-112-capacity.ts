// Generated operational guard 112: capacity.
export type GuardInput = { capacity: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard112 {
  constructor(private readonly minimum = 30) {}
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
    return { name:"Guard112", subject:"capacity", minimum:this.minimum, purpose:"capacity" };
  }
}

export function validateGuard112(value:number, minimum=30) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard112(value:number, minimum=30) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard112(value:number, minimum=30) {
  return value < minimum ? `capacity requires >= ${minimum}` : `capacity satisfies policy`;
}
