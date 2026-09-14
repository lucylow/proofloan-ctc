// Generated operational guard 019: log index.
export type GuardInput = { logIndex: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard019 {
  constructor(private readonly minimum = 11) {}
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
    return { name:"Guard019", subject:"logIndex", minimum:this.minimum, purpose:"log index" };
  }
}

export function validateGuard019(value:number, minimum=11) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard019(value:number, minimum=11) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard019(value:number, minimum=11) {
  return value < minimum ? `log index requires >= ${minimum}` : `log index satisfies policy`;
}
