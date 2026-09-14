import { PRIMARY_APPLICATION_ID, PRIMARY_WALLET_ID } from "../constants";
import type { MockApplication, MockApplicationState, MockRiskTier, MockScenario } from "../types";
import { atOffset } from "../utils";

const seeds: Array<{
  id: string;
  state: MockApplicationState;
  amount: number;
  riskTier: MockRiskTier;
  ageHours: number;
}> = [
  { id: PRIMARY_APPLICATION_ID, state: "EvidenceVerified", amount: 4000, riskTier: "B", ageHours: 5 },
  { id: "PL-4C18D002", state: "Scored", amount: 2500, riskTier: "B", ageHours: 24 },
  { id: "PL-921AC4EF", state: "Executed", amount: 1750, riskTier: "A", ageHours: 72 },
  { id: "PL-13E7CA4B", state: "Rejected", amount: 6000, riskTier: "D", ageHours: 168 },
  { id: "PL-7B00A9D1", state: "OfferReady", amount: 3200, riskTier: "A", ageHours: 16 },
  { id: "PL-5A88D20E", state: "VerifyingEvidence", amount: 5200, riskTier: "C", ageHours: 4 },
  { id: "PL-2E17D8F4", state: "Paused", amount: 2800, riskTier: "C", ageHours: 288 },
  { id: "PL-61DD87CA", state: "Accepted", amount: 2200, riskTier: "A", ageHours: 48 },
];

export function createMockApplications(scenario: MockScenario): MockApplication[] {
  if (scenario === "empty") return [];

  return seeds.map((seed, index) => {
    const highRisk = scenario === "high-risk" && seed.id === PRIMARY_APPLICATION_ID;
    const strong = scenario === "strong-repayment" && seed.id === PRIMARY_APPLICATION_ID;
    const delayed = scenario === "proof-delay" && seed.id === PRIMARY_APPLICATION_ID;
    const rejected = scenario === "proof-rejected" && seed.id === PRIMARY_APPLICATION_ID;

    return {
      id: seed.id,
      walletId: PRIMARY_WALLET_ID,
      borrowerLabel: index === 0 ? "Primary borrower" : `Borrower ${index + 1}`,
      amount: seed.amount,
      currency: "USDC",
      requestedTermDays: seed.amount >= 5000 ? 120 : seed.amount >= 3000 ? 90 : 60,
      state: delayed ? "VerifyingEvidence" : rejected || highRisk ? "Rejected" : strong ? "OfferReady" : seed.state,
      riskTier: highRisk ? "D" : strong ? "A" : seed.riskTier,
      confidence: highRisk ? 61 : strong ? 97 : seed.riskTier === "A" ? 94 : 86,
      createdAt: atOffset(seed.ageHours),
      updatedAt: atOffset(Math.max(seed.ageHours - 2, 0.2)),
    };
  });
}
