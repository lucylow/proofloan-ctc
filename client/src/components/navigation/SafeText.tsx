export function SafeText({ value, fallback = "—" }: { value: unknown; fallback?: string }) {
  if (value === null || value === undefined) return <>{fallback}</>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return <>{String(value)}</>;
  return <>{fallback}</>;
}
