import { MOCK_NOW_ISO } from "./constants";

export function seededHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededNumber(seed: string, min: number, max: number) {
  const hash = seededHash(seed);
  const normalized = (hash % 10_000) / 10_000;
  return min + normalized * (max - min);
}

export function seededInteger(seed: string, min: number, max: number) {
  return Math.floor(seededNumber(seed, min, max + 1));
}

export function pick<T>(seed: string, items: readonly T[]): T {
  return items[seededInteger(seed, 0, items.length - 1)]!;
}

export function hex(seed: string, bytes: number) {
  let value = "";
  for (let index = 0; index < bytes; index += 1) {
    value += seededInteger(`${seed}:${index}`, 0, 255).toString(16).padStart(2, "0");
  }
  return `0x${value}`;
}

export function txHash(seed: string) {
  return hex(seed, 32);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function atOffset(hours: number, now = MOCK_NOW_ISO) {
  return new Date(Date.parse(now) - hours * 3_600_000).toISOString();
}

export function futureOffset(hours: number, now = MOCK_NOW_ISO) {
  return new Date(Date.parse(now) + hours * 3_600_000).toISOString();
}

export function fingerprint(value: unknown) {
  return hex(JSON.stringify(value), 9).slice(0, 20);
}
