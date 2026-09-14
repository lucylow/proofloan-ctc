export function endpointSafety(url: string) {
  try {
    const parsed = new URL(url);
    return {
      valid: true,
      scheme: parsed.protocol.toLowerCase(),
      credentials: parsed.username.length > 0 || parsed.password.length > 0,
      host: parsed.hostname,
    };
  } catch {
    return { valid: false, scheme: "", credentials: false, host: "" };
  }
}
