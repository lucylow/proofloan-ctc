// Generated operational guard 039: retry count.
export type GuardInput = { retries: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard039 {
  constructor(private readonly minimum = 18) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.retries);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"retry count must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`retry count below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard039", subject:"retries", minimum:this.minimum, purpose:"retry count" };
  }
}

export function validateGuard039(value:number, minimum=18) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard039(value:number, minimum=18) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard039(value:number, minimum=18) {
  return value < minimum ? `retry count requires >= ${minimum}` : `retry count satisfies policy`;
}
