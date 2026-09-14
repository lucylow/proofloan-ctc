import { createHash } from "node:crypto";

function canonicalJson(value: unknown, seen = new WeakSet<object>()): string {
  if (value === undefined) return "undefined";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number" && !Number.isFinite(value)) return String(value);
  if (value === null || typeof value !== "object") {
    try {
      const serialized = JSON.stringify(value);
      return typeof serialized === "string" ? serialized : String(value);
    } catch {
      return String(value);
    }
  }
  if (seen.has(value)) return "\"[Circular]\"";
  seen.add(value);
  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalJson(item, seen)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key], seen)}`).join(",")}}`;
}

export function demoHash(value: unknown, length = 64): string {
  const size = Number.isInteger(length) && length > 0 ? Math.min(64, Math.max(1, length)) : 64;
  try {
    return createHash("sha256").update(canonicalJson(value)).digest("hex").slice(0, size);
  } catch {
    return createHash("sha256").update("unhashable").digest("hex").slice(0, size);
  }
}

export function demoHex(seed: string, bytes = 32): string {
  const size = Number.isInteger(bytes) && bytes > 0 ? Math.min(64, bytes) : 32;
  return `0x${demoHash(seed, size * 2).padEnd(size * 2, "0")}`;
}

export function demoAddress(seed: string): string {
  return demoHex(`address:${seed}`, 20);
}

export function demoTxHash(seed: string): string {
  return demoHex(`tx:${seed}`, 32);
}

export function demoProofRoot(seed: string): string {
  return demoHex(`proof:${seed}`, 32);
}
