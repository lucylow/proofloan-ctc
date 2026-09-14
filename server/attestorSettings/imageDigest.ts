import { createHash } from "node:crypto";
import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function releaseDescriptor(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return { image: item.releaseImage, immutableHint: `${item.releaseImage}|${item.chainKey}|${item.decoderContract}` };
}

export function releaseFingerprint(network: AttestorNetwork): string {
  return createHash("sha256").update(JSON.stringify(releaseDescriptor(network))).digest("hex");
}
