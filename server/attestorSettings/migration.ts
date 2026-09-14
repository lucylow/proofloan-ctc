import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function migrationHint(network: AttestorNetwork, previous: { chainKey?: number; releaseImage?: string }) {
  const current = getAttestorSettings(network);
  return {
    chainKeyChanged: previous.chainKey !== undefined && previous.chainKey !== current.chainKey,
    imageChanged: previous.releaseImage !== undefined && previous.releaseImage !== current.releaseImage,
    target: current.releaseImage,
  };
}
