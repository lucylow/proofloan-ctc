// Generated operational guard 013: score.
export type GuardInput = { score: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard013 {
  constructor(private readonly minimum = 10) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.score);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"score must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`score below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard013", subject:"score", minimum:this.minimum, purpose:"score" };
  }
}

export function validateGuard013(value:number, minimum=10) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard013(value:number, minimum=10) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard013(value:number, minimum=10) {
  return value < minimum ? `score requires >= ${minimum}` : `score satisfies policy`;
}
