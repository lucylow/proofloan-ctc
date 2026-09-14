// Generated operational guard 061: block number.
export type GuardInput = { block: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard061 {
  constructor(private readonly minimum = 22) {}
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
    return { name:"Guard061", subject:"block", minimum:this.minimum, purpose:"block number" };
  }
}

export function validateGuard061(value:number, minimum=22) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard061(value:number, minimum=22) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard061(value:number, minimum=22) {
  return value < minimum ? `block number requires >= ${minimum}` : `block number satisfies policy`;
}
