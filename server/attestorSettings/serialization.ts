import { publicAttestorManifest } from "@shared/attestorSettings";
import type { AttestorNetwork } from "./types";

export function publicManifest(network: AttestorNetwork) {
  return publicAttestorManifest(network);
}
