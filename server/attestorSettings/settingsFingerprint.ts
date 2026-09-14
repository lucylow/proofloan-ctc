import { createHash } from "node:crypto";
import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function settingsFingerprint(network: AttestorNetwork) {
  return createHash("sha256").update(JSON.stringify(getAttestorSettings(network))).digest("hex");
}
