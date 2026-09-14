// Generated operational guard 011: lag.
export type GuardInput = { lagBlocks: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard011 {
  constructor(private readonly minimum = 8) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.lagBlocks);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"lag must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`lag below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard011", subject:"lagBlocks", minimum:this.minimum, purpose:"lag" };
  }
}

export function validateGuard011(value:number, minimum=8) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard011(value:number, minimum=8) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard011(value:number, minimum=8) {
  return value < minimum ? `lag requires >= ${minimum}` : `lag satisfies policy`;
}
