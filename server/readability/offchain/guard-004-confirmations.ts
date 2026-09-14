// Generated operational guard 004: confirmation count.
export type GuardInput = { confirmations: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard004 {
  constructor(private readonly minimum = 11) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.confirmations);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"confirmation count must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`confirmation count below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard004", subject:"confirmations", minimum:this.minimum, purpose:"confirmation count" };
  }
}

export function validateGuard004(value:number, minimum=11) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard004(value:number, minimum=11) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard004(value:number, minimum=11) {
  return value < minimum ? `confirmation count requires >= ${minimum}` : `confirmation count satisfies policy`;
}
