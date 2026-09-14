// Generated operational guard 050: transaction index.
export type GuardInput = { transactionIndex: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard050 {
  constructor(private readonly minimum = 14) {}
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
    return { name:"Guard050", subject:"transactionIndex", minimum:this.minimum, purpose:"transaction index" };
  }
}

export function validateGuard050(value:number, minimum=14) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard050(value:number, minimum=14) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard050(value:number, minimum=14) {
  return value < minimum ? `transaction index requires >= ${minimum}` : `transaction index satisfies policy`;
}
