// Generated operational guard 114: quorum.
export type GuardInput = { quorum: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard114 {
  constructor(private readonly minimum = 32) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.quorum);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"quorum must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`quorum below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard114", subject:"quorum", minimum:this.minimum, purpose:"quorum" };
  }
}

export function validateGuard114(value:number, minimum=32) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard114(value:number, minimum=32) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard114(value:number, minimum=32) {
  return value < minimum ? `quorum requires >= ${minimum}` : `quorum satisfies policy`;
}
