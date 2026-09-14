import { createHash } from "node:crypto";

export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function normalizeHex(value: string): string {
  const v = value.trim().toLowerCase();
  return v.startsWith("0x") ? v.slice(2) : v;
}

export function proofFingerprint(parts: string[]): string {
  return sha256Hex(parts.map(normalizeHex).join("|"));
}

export function encodedBytesFromHex(hex: string): number {
  const raw = normalizeHex(hex);
  if (!raw) return 0;
  return Math.ceil(raw.length / 2);
}
