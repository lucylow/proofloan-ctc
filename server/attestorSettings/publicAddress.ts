export function validatePublicAddress(value: string | undefined) {
  if (!value) return { valid: false, reason: "not configured" };
  const valid = value.includes("/p2p/") || /^dns[46]?:\/\//.test(value) || /^https?:\/\//.test(value);
  return { valid, reason: valid ? "reachable-address-shape" : "expected a reachable host or libp2p multiaddr" };
}
