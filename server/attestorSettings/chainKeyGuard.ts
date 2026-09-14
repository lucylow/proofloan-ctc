import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function assertChainKey(network: AttestorNetwork, value: number): void {
  const expected = getAttestorSettings(network).chainKey;
  if (value !== expected) {
    throw new Error(`Attestor chain key mismatch: expected ${expected}, got ${value}.`);
  }
}

export function chainKeyExplanation(network: AttestorNetwork): string {
  const item = getAttestorSettings(network);
  return `${item.sourceChain} uses chainKey ${item.chainKey} on ${item.environment}.`;
}
