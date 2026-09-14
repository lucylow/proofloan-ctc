// Generated operational guard 103: score.
export type GuardInput = { score: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard103 {
  constructor(private readonly minimum = 31) {}
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
    return { name:"Guard103", subject:"score", minimum:this.minimum, purpose:"score" };
  }
}

export function validateGuard103(value:number, minimum=31) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard103(value:number, minimum=31) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard103(value:number, minimum=31) {
  return value < minimum ? `score requires >= ${minimum}` : `score satisfies policy`;
}
