import type { MockDataset } from "../types";

export function proofIntegrity(dataset: MockDataset) {
  return {
    merkleValid: dataset.merkleProofs.filter(item => item.valid).length,
    continuityValid: dataset.continuityProofs.filter(item => item.valid).length,
    rejected: dataset.proofRequests.filter(item => item.status === "rejected").length,
    verified: dataset.proofRequests.filter(item => item.status === "verified").length,
  };
}
