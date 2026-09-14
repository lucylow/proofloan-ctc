// Generated operational guard 053: concurrency.
export type GuardInput = { concurrency: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard053 {
  constructor(private readonly minimum = 17) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.concurrency);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"concurrency must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`concurrency below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard053", subject:"concurrency", minimum:this.minimum, purpose:"concurrency" };
  }
}

export function validateGuard053(value:number, minimum=17) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard053(value:number, minimum=17) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard053(value:number, minimum=17) {
  return value < minimum ? `concurrency requires >= ${minimum}` : `concurrency satisfies policy`;
}
