export function parseDateSafe(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDateSafe(value: unknown, fallback = "Unknown date") {
  const date = parseDateSafe(value);
  if (!date) return fallback;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return fallback;
  }
}

export function relativeTimeSafe(value: unknown, fallback = "Unknown") {
  const date = parseDateSafe(value);
  if (!date) return fallback;
  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(difference / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
