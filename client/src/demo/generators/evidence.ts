import type {
  DemoApplication,
  DemoEvidence,
} from "../types";

import {
  DEMO_CHAINS,
  DEMO_TRANSACTIONS,
} from "../constants";

import {
  daysAgo,
  seededInteger,
} from "../utils";

const evidenceTypes = [
  "REPAYMENT",
  "COLLATERAL_DEPOSIT",
  "LIQUIDITY",
  "WALLET_ACTIVITY",
  "LATE_PAYMENT",
  "BALANCE_HISTORY",
  "CONTRACT_INTERACTION",
] as const;

export function createDemoEvidence(
  applications: DemoApplication[],
): DemoEvidence[] {
  const output: DemoEvidence[] = [];

  let globalIndex = 0;

  for (const application of applications) {
    const count = Math.min(
      application.evidenceCount,
      10,
    );

    for (let index = 0; index < count; index += 1) {
      const chain =
        index % 2 === 0
          ? DEMO_CHAINS.ethereumSepolia
          : DEMO_CHAINS.polygonAmoy;

      const type =
        evidenceTypes[
          index % evidenceTypes.length
        ];

      const aging =
        index === count - 1 &&
        application.id === "PL-7F42A91C";

      const stale =
        application.id === "PL-13E7CA4B" &&
        index === count - 1;

      output.push({
        id: `EV-${String(globalIndex + 1).padStart(
          3,
          "0",
        )}`,
        applicationId: application.id,
        chain: chain.name,
        chainId: chain.chainId,
        type,
        amount: seededInteger(
          `${application.id}:amount:${index}`,
          200,
          4200,
        ),
        currency: "USDC",
        sourceTransaction:
          DEMO_TRANSACTIONS[
            globalIndex % DEMO_TRANSACTIONS.length
          ],
        blockNumber: seededInteger(
          `${application.id}:block:${index}`,
          6800000,
          6849999,
        ),
        timestamp: daysAgo(
          stale
            ? 90
            : aging
              ? 31
              : seededInteger(
                  `${application.id}:days:${index}`,
                  1,
                  18,
                ),
        ),
        freshness: stale
          ? "Stale"
          : aging
            ? "Aging"
            : "Fresh",
        verifier:
          index % 2 === 0
            ? "Attestcoin verifier"
            : "ProofLoan verifier",
        confidence: seededInteger(
          `${application.id}:confidence:${index}`,
          91,
          99,
        ),
        verified: !stale,
      });

      globalIndex += 1;
    }
  }

  return output;
}
