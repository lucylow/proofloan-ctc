// Generated operational guard 054: quorum.
export type GuardInput = { quorum: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard054 {
  constructor(private readonly minimum = 18) {}
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
    return { name:"Guard054", subject:"quorum", minimum:this.minimum, purpose:"quorum" };
  }
}

export function validateGuard054(value:number, minimum=18) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard054(value:number, minimum=18) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard054(value:number, minimum=18) {
  return value < minimum ? `quorum requires >= ${minimum}` : `quorum satisfies policy`;
}
