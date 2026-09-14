// Generated operational guard 075: epoch.
export type GuardInput = { epoch: number; enabled?: boolean; strict?: boolean };
export type GuardResult = { ok: boolean; code: string; value: number; message?: string };

export class Guard075 {
  constructor(private readonly minimum = 21) {}
  check(input: GuardInput): GuardResult {
    const value = Number(input.epoch);
    if (!Number.isFinite(value)) return { ok:false, code:"INVALID", value, message:"epoch must be finite" };
    if ((input.enabled ?? true) === false) return { ok:true, code:"DISABLED", value };
    if (value < this.minimum) return { ok:false, code:"BELOW_MIN", value, message:`epoch below minimum ${this.minimum}` };
    return { ok:true, code:"OK", value };
  }
  assert(input: GuardInput): number {
    const result = this.check(input);
    if (!result.ok && (input.strict ?? true)) throw new Error(`${result.code}: ${result.message ?? "guard failed"}`);
    return result.value;
  }
  minimumValue() { return this.minimum; }
  describe() {
    return { name:"Guard075", subject:"epoch", minimum:this.minimum, purpose:"epoch" };
  }
}

export function validateGuard075(value:number, minimum=21) {
  if (!Number.isFinite(value)) return false;
  return value >= minimum;
}

export function normalizeGuard075(value:number, minimum=21) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function explainGuard075(value:number, minimum=21) {
  return value < minimum ? `epoch requires >= ${minimum}` : `epoch satisfies policy`;
}
