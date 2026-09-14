import type { MockApplication, MockOffer, MockRiskGuardCheck } from "../types";
import { futureOffset } from "../utils";

export function createMockOffers(
  applications: MockApplication[],
  guards: MockRiskGuardCheck[],
): MockOffer[] {
  return applications.map(application => {
    const guard = guards.find(item => item.applicationId === application.id);
    const blocked = guard?.status === "Blocked";
    const executed = application.state === "Executed";
    const accepted = application.state === "Accepted";

    return {
      id: `off_${application.id}`,
      applicationId: application.id,
      amount: Math.min(application.amount, 4500),
      apr: application.riskTier === "A" ? 9.4 : application.riskTier === "B" ? 12.1 : 16.8,
      ltv: application.amount > 4000 ? 0.48 : 0.32,
      termDays: application.requestedTermDays,
      fee: 25,
      status: blocked ? "Unavailable" : executed ? "Executed" : accepted ? "Accepted" : "Ready",
      expiresAt: futureOffset(72),
      pool: "Creditcoin USDC pool",
      riskTier: application.riskTier,
      featured: application.id === "PL-7F42A91C",
    };
  });
}
