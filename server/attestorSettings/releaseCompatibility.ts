import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function releaseCompatible(network: AttestorNetwork, image: string) {
  return image === getAttestorSettings(network).releaseImage;
}
