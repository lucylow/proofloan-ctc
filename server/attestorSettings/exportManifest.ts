import { publicManifest } from "./serialization";
import { ATTESTOR_NETWORKS } from "@shared/attestorSettings";

export function exportManifest() {
  return ATTESTOR_NETWORKS.map(publicManifest);
}
