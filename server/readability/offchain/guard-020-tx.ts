// Generated operational guard 020: transaction index.
export type GuardInput = { transactionIndex: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard020 {
  constructor(private readonly minimum = 7) {}
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
    return { name:"Guard020", subject:"transactionIndex", minimum:this.minimum, purpose:"transaction index" };
  }
}

export function validateGuard020(value:number, minimum=7) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard020(value:number, minimum=7) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard020(value:number, minimum=7) {
  return value < minimum ? `transaction index requires >= ${minimum}` : `transaction index satisfies policy`;
}
