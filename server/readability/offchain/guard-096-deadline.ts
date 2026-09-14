// Generated operational guard 096: deadline.
export type GuardInput = { deadlineMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard096 {
  constructor(private readonly minimum = 29) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.deadlineMs);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"deadline must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`deadline below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard096", subject:"deadlineMs", minimum:this.minimum, purpose:"deadline" };
  }
}

export function validateGuard096(value:number, minimum=29) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard096(value:number, minimum=29) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard096(value:number, minimum=29) {
  return value < minimum ? `deadline requires >= ${minimum}` : `deadline satisfies policy`;
}
