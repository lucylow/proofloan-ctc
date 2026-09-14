export function safeUrl(value: string | undefined | null): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    if (!["https:", "http:"].includes(url.protocol)) return undefined;
    return url;
  } catch {
    return undefined;
  }
}
