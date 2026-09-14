export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (!isFiniteNumber(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function safeArray<T>(value: unknown, guard?: (item: unknown) => item is T): T[] {
  if (!Array.isArray(value)) return [];
  if (!guard) return value as T[];
  return value.filter(guard);
}
