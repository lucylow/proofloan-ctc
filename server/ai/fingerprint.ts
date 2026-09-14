import { createHash } from "node:crypto";

export function stableJson(value: unknown): string {
  const sort = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(sort);
    if (input && typeof input === "object") {
      return Object.keys(input as Record<string, unknown>).sort().reduce<Record<string, unknown>>((out, key) => {
        out[key] = sort((input as Record<string, unknown>)[key]);
        return out;
      }, {});
    }
    return input;
  };
  return JSON.stringify(sort(value));
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function shortHash(value: unknown, length = 18): string { return sha256(value).slice(0, length); }
export function requestFingerprint(value: unknown): string { return `ai_req_${shortHash(value, 24)}`; }
export function outputFingerprint(value: unknown): string { return `ai_out_${shortHash(value, 24)}`; }
export function modelFingerprint(modelId: string, version: string, policyHash: string): string { return shortHash({ modelId, version, policyHash }, 24); }
