import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function detectDrift(
  network: AttestorNetwork,
  observed: { chainKey: number; releaseImage: string; cc3Url: string },
) {
  const expected = getAttestorSettings(network);
  return {
    chainKey: observed.chainKey !== expected.chainKey,
    release: observed.releaseImage !== expected.releaseImage,
    cc3: observed.cc3Url !== expected.cc3RpcUrl,
  };
}
