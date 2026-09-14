import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function operatorNotes(network: AttestorNetwork) {
  return getAttestorSettings(network).notes.slice();
}
