export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeVolume(raw: number, scale = 1_000_000): number {
  return clamp01(Math.log10(1 + Math.max(0, raw)) / Math.log10(1 + scale));
}

export function ageScore(ageDays: number, horizonDays = 365): number {
  return clamp01(Math.log1p(Math.max(0, ageDays)) / Math.log1p(horizonDays));
}
