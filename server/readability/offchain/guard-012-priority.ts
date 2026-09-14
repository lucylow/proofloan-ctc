// Generated operational guard 012: priority.
export type GuardInput = { priority: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard012 {
  constructor(private readonly minimum = 9) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.priority);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"priority must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`priority below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard012", subject:"priority", minimum:this.minimum, purpose:"priority" };
  }
}

export function validateGuard012(value:number, minimum=9) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard012(value:number, minimum=9) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard012(value:number, minimum=9) {
  return value < minimum ? `priority requires >= ${minimum}` : `priority satisfies policy`;
}
