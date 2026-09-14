// Generated operational guard 076: nonce.
export type GuardInput = { nonce: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard076 {
  constructor(private readonly minimum = 22) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.nonce);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"nonce must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`nonce below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard076", subject:"nonce", minimum:this.minimum, purpose:"nonce" };
  }
}

export function validateGuard076(value:number, minimum=22) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard076(value:number, minimum=22) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard076(value:number, minimum=22) {
  return value < minimum ? `nonce requires >= ${minimum}` : `nonce satisfies policy`;
}
