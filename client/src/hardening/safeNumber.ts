export function parseFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parsePositiveNumber(value: unknown, fallback = 0): number {
  const parsed = parseFiniteNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

export function parseBoundedNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = parseFiniteNumber(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

export function safePercent(value: unknown, fallback = 0): number {
  return parseBoundedNumber(value, 0, 100, fallback);
}
