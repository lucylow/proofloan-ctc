// Generated operational guard 032: cursor.
export type GuardInput = { cursor: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard032 {
  constructor(private readonly minimum = 16) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.cursor);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"cursor must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`cursor below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard032", subject:"cursor", minimum:this.minimum, purpose:"cursor" };
  }
}

export function validateGuard032(value:number, minimum=16) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard032(value:number, minimum=16) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard032(value:number, minimum=16) {
  return value < minimum ? `cursor requires >= ${minimum}` : `cursor satisfies policy`;
}
