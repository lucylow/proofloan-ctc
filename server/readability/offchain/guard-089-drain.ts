// Generated operational guard 089: drain window.
export type GuardInput = { drainMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard089 {
  constructor(private readonly minimum = 25) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.drainMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"drain window must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`drain window below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard089", subject:"drainMs", minimum:this.minimum, purpose:"drain window" };
  }
}

export function validateGuard089(value:number, minimum=25) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard089(value:number, minimum=25) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard089(value:number, minimum=25) {
  return value < minimum ? `drain window requires >= ${minimum}` : `drain window satisfies policy`;
}
