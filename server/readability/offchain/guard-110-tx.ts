// Generated operational guard 110: transaction index.
export type GuardInput = { transactionIndex: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard110 {
  constructor(private readonly minimum = 28) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.transactionIndex);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"transaction index must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`transaction index below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard110", subject:"transactionIndex", minimum:this.minimum, purpose:"transaction index" };
  }
}

export function validateGuard110(value:number, minimum=28) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard110(value:number, minimum=28) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard110(value:number, minimum=28) {
  return value < minimum ? `transaction index requires >= ${minimum}` : `transaction index satisfies policy`;
}
