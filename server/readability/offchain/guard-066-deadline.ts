// Generated operational guard 066: deadline.
export type GuardInput = { deadlineMs: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard066 {
  constructor(private readonly minimum = 22) {}
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
    return { name:"Guard066", subject:"deadlineMs", minimum:this.minimum, purpose:"deadline" };
  }
}

export function validateGuard066(value:number, minimum=22) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard066(value:number, minimum=22) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard066(value:number, minimum=22) {
  return value < minimum ? `deadline requires >= ${minimum}` : `deadline satisfies policy`;
}
