import type { MockDataset } from "./types";

export function searchApplications(dataset: MockDataset, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return dataset.applications;
  return dataset.applications.filter(item =>
    [item.id, item.borrowerLabel, item.state, item.riskTier].join(" ").toLowerCase().includes(normalized),
  );
}

export function searchFacts(dataset: MockDataset, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return dataset.facts;
  return dataset.facts.filter(item =>
    [item.id, item.txHash, item.chainName, item.eventType, item.applicationId].join(" ").toLowerCase().includes(normalized),
  );
}

export function searchProofs(dataset: MockDataset, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return dataset.proofRequests;
  return dataset.proofRequests.filter(item =>
    [item.id, item.txHash, item.status, item.chainId].join(" ").toLowerCase().includes(normalized),
  );
}

export function searchChains(dataset: MockDataset, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return dataset.chains;
  return dataset.chains.filter(item =>
    [item.id, item.name, item.nativeSymbol].join(" ").toLowerCase().includes(normalized),
  );
}
