import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export type ChainStateObservation = {
  chainKey: number;
  sourceChainId?: number;
  genesisBlock?: number;
};

export function reconcileChainState(network: AttestorNetwork, observed: ChainStateObservation) {
  const expected = getAttestorSettings(network);
  const mismatches: string[] = [];
  if (observed.chainKey !== expected.chainKey) {
    mismatches.push(`chainKey expected ${expected.chainKey}, got ${observed.chainKey}`);
  }
  if (observed.sourceChainId !== undefined && observed.sourceChainId !== expected.sourceChainId) {
    mismatches.push(`sourceChainId expected ${expected.sourceChainId}, got ${observed.sourceChainId}`);
  }
  if (observed.genesisBlock !== undefined && observed.genesisBlock !== expected.genesisBlock) {
    mismatches.push(`genesisBlock expected ${expected.genesisBlock}, got ${observed.genesisBlock}`);
  }
  return { consistent: mismatches.length === 0, mismatches };
}
