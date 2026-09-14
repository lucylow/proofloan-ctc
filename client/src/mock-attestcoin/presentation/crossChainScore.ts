import type { MockDataset } from "../types";

export function crossChainScore(dataset: MockDataset) {
  const count = new Set(dataset.facts.map(fact => fact.chainId)).size;
  return {
    chains: count,
    score: Math.min(100, count * 20),
    names: Array.from(new Set(dataset.facts.map(fact => fact.chainName))),
  };
}
