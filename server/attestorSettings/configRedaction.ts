export function redactConfig(config: Record<string, unknown>) {
  const copy = { ...config };
  for (const key of Object.keys(copy)) {
    if (/secret|mnemonic|seed|token|password|apikey|api_key/i.test(key)) copy[key] = "[redacted]";
  }
  return copy;
}
