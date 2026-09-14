// Generated operational guard 041: lag.
export type GuardInput = { lagBlocks: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard041 {
  constructor(private readonly minimum = 15) {}
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
    return { name:"Guard041", subject:"lagBlocks", minimum:this.minimum, purpose:"lag" };
  }
}

export function validateGuard041(value:number, minimum=15) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard041(value:number, minimum=15) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard041(value:number, minimum=15) {
  return value < minimum ? `lag requires >= ${minimum}` : `lag satisfies policy`;
}
