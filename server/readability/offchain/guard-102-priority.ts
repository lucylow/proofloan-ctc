// Generated operational guard 102: priority.
export type GuardInput = { priority: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard102 {
  constructor(private readonly minimum = 30) {}
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
    return { name:"Guard102", subject:"priority", minimum:this.minimum, purpose:"priority" };
  }
}

export function validateGuard102(value:number, minimum=30) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard102(value:number, minimum=30) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard102(value:number, minimum=30) {
  return value < minimum ? `priority requires >= ${minimum}` : `priority satisfies policy`;
}
