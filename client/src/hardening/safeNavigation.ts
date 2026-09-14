const ALLOWED_INTERNAL_PREFIXES = [
  "/",
];

export function isSafeInternalPath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  if (path.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path)) return false;
  return ALLOWED_INTERNAL_PREFIXES.some(prefix => path.startsWith(prefix));
}

export function sanitizeInternalPath(path: string, fallback = "/dashboard") {
  if (!isSafeInternalPath(path)) return fallback;
  return path;
}

export function navigateSafely(
  navigate: (path: string) => void,
  path: string,
  fallback = "/dashboard",
) {
  navigate(sanitizeInternalPath(path, fallback));
}
