import type { MockDataset } from "../types";

export function attestationStats(dataset: MockDataset) {
  return {
    rounds: dataset.attestations.length,
    quorum: dataset.attestations.filter(item => item.status === "quorum").length,
    insufficient: dataset.attestations.filter(item => item.status === "insufficient").length,
    averageWeight: dataset.attestations.length === 0
      ? 0
      : dataset.attestations.reduce((total, item) => total + item.signatureWeight, 0) / dataset.attestations.length,
  };
}
