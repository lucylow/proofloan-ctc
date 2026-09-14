// Generated operational guard 016: nonce.
export type GuardInput = { nonce: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard016 {
  constructor(private readonly minimum = 8) {}
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
    return { name:"Guard016", subject:"nonce", minimum:this.minimum, purpose:"nonce" };
  }
}

export function validateGuard016(value:number, minimum=8) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard016(value:number, minimum=8) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard016(value:number, minimum=8) {
  return value < minimum ? `nonce requires >= ${minimum}` : `nonce satisfies policy`;
}
