import { clamp } from "./utils";
import type { MockDataset } from "./types";

export function sanitizeMockDataset(dataset: MockDataset): MockDataset {
  return {
    ...dataset,
    presentationOnly: true,
    wallets: dataset.wallets.map(wallet => ({
      ...wallet,
      nativeBalance: clamp(wallet.nativeBalance, 0, 1_000_000),
      stablecoinBalance: clamp(wallet.stablecoinBalance, 0, 10_000_000),
    })),
    facts: dataset.facts.map(fact => ({
      ...fact,
      amount: clamp(fact.amount, 0, 1_000_000),
    })),
  };
}
