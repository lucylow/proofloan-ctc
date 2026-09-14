import type { ReadabilityQuery, SourceEvent } from "@shared/readability";

export const READABILITY_DEMO_CONTRACT = "0x742d35cc6634c0532925a3b844bc454e4438f44e";

export function fixtureObservedAt(now = new Date()): string {
  return now.toISOString();
}

export function fixtureSourceEvent(overrides: Partial<SourceEvent> = {}): SourceEvent {
  return {
    chainId: "ethereum-sepolia",
    blockNumber: 8_441_000,
    blockHash: `0x${"ab".repeat(32)}`,
    transactionHash: `0x${"cd".repeat(32)}`,
    transactionIndex: 3,
    logIndex: 1,
    contractAddress: READABILITY_DEMO_CONTRACT,
    eventName: "CreditPositionOpened",
    topics: [`0x${"11".repeat(32)}`],
    data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    confirmations: 40,
    observedAt: fixtureObservedAt(),
    ...overrides,
  };
}

export function fixtureReadabilityQuery(overrides: Partial<ReadabilityQuery> = {}): ReadabilityQuery {
  return {
    environment: "cc3-testnet",
    sourceChain: "Ethereum Sepolia",
    sourceContract: READABILITY_DEMO_CONTRACT,
    eventName: "CreditPositionOpened",
    minConfirmations: 32,
    ...overrides,
  };
}
