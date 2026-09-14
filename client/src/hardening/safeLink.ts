const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function safeExternalUrl(value: string, fallback = "#") {
  return isSafeExternalUrl(value) ? value : fallback;
}

export function safeExplorerUrl(baseUrl: string, txHash: string) {
  if (!isSafeExternalUrl(baseUrl)) return "#";
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return "#";
  return `${baseUrl.replace(/\/$/, "")}/tx/${txHash}`;
}
