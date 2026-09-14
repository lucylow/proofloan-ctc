import { MOCK_CHAINS } from "../chainCatalog";
import { MOCK_FACT_EVENTS } from "../factCatalog";
import type { MockApplication, MockChainId, MockFactEvent, MockScenario, MockTransaction } from "../types";
import { seededInteger, txHash, atOffset } from "../utils";

function chainFor(index: number, scenario: MockScenario): MockChainId {
  if (scenario === "multi-chain" || scenario === "cross-chain-wealth" || scenario === "judge") {
    return MOCK_CHAINS[index % MOCK_CHAINS.length]!.id;
  }
  return index % 2 === 0 ? "ethereum-sepolia" : "polygon-amoy";
}

function eventFor(index: number, scenario: MockScenario): MockFactEvent {
  if (scenario === "strong-repayment") return index === 3 ? "COLLATERAL_DEPOSIT" : "REPAYMENT";
  if (scenario === "high-risk") return index % 3 === 0 ? "LATE_PAYMENT" : MOCK_FACT_EVENTS[index % MOCK_FACT_EVENTS.length]!;
  return MOCK_FACT_EVENTS[index % MOCK_FACT_EVENTS.length]!;
}

export function createMockTransactions(
  seed: string,
  applications: MockApplication[],
  scenario: MockScenario,
): MockTransaction[] {
  if (scenario === "empty") return [];

  const sparse = scenario === "new-wallet";
  const dense = scenario === "strong-repayment" || scenario === "cross-chain-wealth";

  return applications.flatMap((application, applicationIndex) => {
    const count = sparse ? 2 : dense ? 8 : 5;
    return Array.from({ length: count }, (_, index) => {
      const chainId = chainFor(applicationIndex + index, scenario);
      const eventType = eventFor(index, scenario);
      const hours = scenario === "fresh-evidence" ? 6 + index : scenario === "aging-evidence" ? 720 + index * 48 : 18 + index * 30;
      const blockNumber = 6_400_000 + applicationIndex * 10_000 + index * 37;
      return {
        id: `tx_${application.id}_${index + 1}`,
        walletId: application.walletId,
        applicationId: application.id,
        chainId,
        txHash: txHash(`${seed}:${application.id}:${index}`),
        blockNumber,
        timestamp: atOffset(hours),
        eventType,
        amount: eventType === "LATE_PAYMENT" ? 90 + index * 20 : 400 + index * 180,
        asset: "USDC" as const,
        confirmations: scenario === "proof-delay" && index === 0 ? 2 : 18 + index,
        finalized: scenario !== "proof-delay" || index > 0,
      };
    });
  });
}
