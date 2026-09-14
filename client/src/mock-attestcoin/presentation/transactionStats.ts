import type { MockDataset } from "../types";

export function transactionStats(dataset: MockDataset) {
  return {
    count: dataset.transactions.length,
    finalized: dataset.transactions.filter(item => item.finalized).length,
    volume: dataset.transactions.reduce((total, item) => total + item.amount, 0),
  };
}
