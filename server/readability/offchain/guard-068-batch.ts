// Generated operational guard 068: batch size.
export type GuardInput = { batchSize: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard068 {
  constructor(private readonly minimum = 24) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.batchSize);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"batch size must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`batch size below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard068", subject:"batchSize", minimum:this.minimum, purpose:"batch size" };
  }
}

export function validateGuard068(value:number, minimum=24) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard068(value:number, minimum=24) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard068(value:number, minimum=24) {
  return value < minimum ? `batch size requires >= ${minimum}` : `batch size satisfies policy`;
}
