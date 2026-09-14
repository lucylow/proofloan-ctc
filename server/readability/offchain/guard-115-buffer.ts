// Generated operational guard 115: buffer.
export type GuardInput = { buffer: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard115 {
  constructor(private readonly minimum = 28) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.buffer);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"buffer must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`buffer below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard115", subject:"buffer", minimum:this.minimum, purpose:"buffer" };
  }
}

export function validateGuard115(value:number, minimum=28) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard115(value:number, minimum=28) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard115(value:number, minimum=28) {
  return value < minimum ? `buffer requires >= ${minimum}` : `buffer satisfies policy`;
}
