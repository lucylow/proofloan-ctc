export function secretPolicy(value: string) {
  const trimmed = value.trim();
  const raw = /^0x[a-fA-F0-9]{64}$/.test(trimmed);
  const words = trimmed.split(/\s+/).length;
  const mnemonic = words === 12 || words === 15 || words === 18 || words === 21 || words === 24;
  return {
    valid: raw || mnemonic,
    kind: raw ? "hex-seed" : mnemonic ? "mnemonic" : "invalid",
    shouldRedact: true,
  } as const;
}
