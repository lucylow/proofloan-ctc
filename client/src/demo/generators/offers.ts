import type {
  DemoApplication,
  DemoOffer,
} from "../types";

import {
  DEMO_POLICY_VERSION,
} from "../constants";

import {
  futureDays,
} from "../utils";

export function createDemoOffers(
  applications: DemoApplication[],
): DemoOffer[] {
  const eligible = applications.filter(
    application =>
      application.state !== "Rejected" &&
      application.riskTier !== "D" &&
      application.riskTier !== "E",
  );

  return eligible.flatMap(
    (application, index) => {
      const baseAmount = application.amount;

      const offers: DemoOffer[] = [
        {
          id: `OFF-${application.id}-1`,
          applicationId: application.id,
          amount: baseAmount,
          apr:
            application.riskTier === "A"
              ? 8.4
              : application.riskTier === "B"
                ? 9.4
                : 11.9,
          ltv:
            application.riskTier === "A"
              ? 0.35
              : application.riskTier === "B"
                ? 0.42
                : 0.52,
          termDays: 90,
          fee: Math.round(baseAmount * 0.012),
          currency: "USDC",
          status:
            application.state === "Executed"
              ? "Executed"
              : application.state === "Accepted"
                ? "Accepted"
                : index === 0
                  ? "Ready"
                  : "Expiring",
          expiresAt: futureDays(
            index === 0 ? 3 : 1,
          ),
          pool: index % 2 === 0
            ? "USDC Growth Pool"
            : "Stable Yield Pool",
          policyVersion: DEMO_POLICY_VERSION,
          riskTier: application.riskTier,
          featured: index === 0,
        },
      ];

      if (application.state === "OfferReady") {
        offers.push({
          id: `OFF-${application.id}-2`,
          applicationId: application.id,
          amount: Math.max(
            1000,
            Math.round(baseAmount * 0.75),
          ),
          apr: 8.1,
          ltv: 0.31,
          termDays: 60,
          fee: Math.round(
            baseAmount * 0.75 * 0.01,
          ),
          currency: "USDC",
          status: "Ready",
          expiresAt: futureDays(5),
          pool: "USDC Growth Pool",
          policyVersion: DEMO_POLICY_VERSION,
          riskTier: application.riskTier,
          featured: false,
        });
      }

      return offers;
    },
  );
}
