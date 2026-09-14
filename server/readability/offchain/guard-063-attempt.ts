// Generated operational guard 063: attempt count.
export type GuardInput = { attempts: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard063 {
  constructor(private readonly minimum = 24) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.attempts);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"attempt count must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`attempt count below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard063", subject:"attempts", minimum:this.minimum, purpose:"attempt count" };
  }
}

export function validateGuard063(value:number, minimum=24) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard063(value:number, minimum=24) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard063(value:number, minimum=24) {
  return value < minimum ? `attempt count requires >= ${minimum}` : `attempt count satisfies policy`;
}
