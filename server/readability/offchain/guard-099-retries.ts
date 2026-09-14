// Generated operational guard 099: retry count.
export type GuardInput = { retries: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard099 {
  constructor(private readonly minimum = 32) {}
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
    return { name:"Guard099", subject:"retries", minimum:this.minimum, purpose:"retry count" };
  }
}

export function validateGuard099(value:number, minimum=32) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard099(value:number, minimum=32) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard099(value:number, minimum=32) {
  return value < minimum ? `retry count requires >= ${minimum}` : `retry count satisfies policy`;
}
