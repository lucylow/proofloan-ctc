// Generated operational guard 091: block number.
export type GuardInput = { block: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard091 {
  constructor(private readonly minimum = 29) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.block);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"block number must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`block number below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard091", subject:"block", minimum:this.minimum, purpose:"block number" };
  }
}

export function validateGuard091(value:number, minimum=29) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard091(value:number, minimum=29) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard091(value:number, minimum=29) {
  return value < minimum ? `block number requires >= ${minimum}` : `block number satisfies policy`;
}
