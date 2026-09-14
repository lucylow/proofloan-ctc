// Generated operational guard 010: timeout.
export type GuardInput = { timeoutMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard010 {
  constructor(private readonly minimum = 7) {}
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
    return { name:"Guard010", subject:"timeoutMs", minimum:this.minimum, purpose:"timeout" };
  }
}

export function validateGuard010(value:number, minimum=7) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard010(value:number, minimum=7) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard010(value:number, minimum=7) {
  return value < minimum ? `timeout requires >= ${minimum}` : `timeout satisfies policy`;
}
