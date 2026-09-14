// Generated operational guard 100: timeout.
export type GuardInput = { timeoutMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard100 {
  constructor(private readonly minimum = 28) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.timeoutMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"timeout must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`timeout below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard100", subject:"timeoutMs", minimum:this.minimum, purpose:"timeout" };
  }
}

export function validateGuard100(value:number, minimum=28) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard100(value:number, minimum=28) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard100(value:number, minimum=28) {
  return value < minimum ? `timeout requires >= ${minimum}` : `timeout satisfies policy`;
}
