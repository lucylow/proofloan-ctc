// Generated operational guard 079: log index.
export type GuardInput = { logIndex: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard079 {
  constructor(private readonly minimum = 25) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.logIndex);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"log index must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`log index below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard079", subject:"logIndex", minimum:this.minimum, purpose:"log index" };
  }
}

export function validateGuard079(value:number, minimum=25) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard079(value:number, minimum=25) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard079(value:number, minimum=25) {
  return value < minimum ? `log index requires >= ${minimum}` : `log index satisfies policy`;
}
