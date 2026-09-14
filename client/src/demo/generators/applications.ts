import type {
  DemoApplication,
  DemoApplicationState,
} from "../types";

import {
  DEMO_FEATURE_VERSION,
  DEMO_MODEL_VERSION,
  DEMO_POLICY_VERSION,
} from "../constants";

import {
  daysAgo,
  seededInteger,
} from "../utils";

const applicationSeeds: Array<{
  id: string;
  state: DemoApplicationState;
  amount: number;
  riskTier: DemoApplication["riskTier"];
  age: number;
}> = [
  {
    id: "PL-7F42A91C",
    state: "EvidenceVerified",
    amount: 4000,
    riskTier: "B",
    age: 0.2,
  },
  {
    id: "PL-4C18D002",
    state: "Scored",
    amount: 2500,
    riskTier: "B",
    age: 1,
  },
  {
    id: "PL-921AC4EF",
    state: "Executed",
    amount: 1750,
    riskTier: "A",
    age: 3,
  },
  {
    id: "PL-13E7CA4B",
    state: "Rejected",
    amount: 6000,
    riskTier: "D",
    age: 7,
  },
  {
    id: "PL-7B00A9D1",
    state: "OfferReady",
    amount: 3200,
    riskTier: "A",
    age: 0.7,
  },
  {
    id: "PL-5A88D20E",
    state: "VerifyingEvidence",
    amount: 5200,
    riskTier: "C",
    age: 0.15,
  },
  {
    id: "PL-2E17D8F4",
    state: "Paused",
    amount: 2800,
    riskTier: "C",
    age: 12,
  },
  {
    id: "PL-61DD87CA",
    state: "Accepted",
    amount: 2200,
    riskTier: "A",
    age: 2,
  },
];

export function createDemoApplications(): DemoApplication[] {
  return applicationSeeds.map((seed, index) => {
    const confidence = Math.round(
      seededInteger(
        `${seed.id}:confidence`,
        seed.riskTier === "A" ? 90 : 78,
        seed.riskTier === "A" ? 99 : 96,
      ),
    );

    return {
      id: seed.id,
      borrowerLabel:
        index === 0
          ? "Primary borrower"
          : `Borrower ${index + 1}`,
      amount: seed.amount,
      currency: "USDC",
      requestedTermDays:
        seed.amount >= 5000
          ? 120
          : seed.amount >= 3000
            ? 90
            : 60,
      state: seed.state,
      riskTier: seed.riskTier,
      confidence,
      createdAt: daysAgo(seed.age),
      updatedAt: daysAgo(Math.max(seed.age - 0.08, 0)),
      evidenceCount: seededInteger(
        `${seed.id}:evidence`,
        8,
        21,
      ),
      evidenceFreshness: seededInteger(
        `${seed.id}:freshness`,
        72,
        99,
      ),
      repaymentHistory: seededInteger(
        `${seed.id}:repayments`,
        5,
        29,
      ),
      leverageRatio: Number(
        (
          seededInteger(
            `${seed.id}:leverage`,
            15,
            62,
          ) / 100
        ).toFixed(2),
      ),
      loanToValue: Number(
        (
          seededInteger(
            `${seed.id}:ltv`,
            18,
            65,
          ) / 100
        ).toFixed(2),
      ),
      walletAgeDays: seededInteger(
        `${seed.id}:walletAge`,
        84,
        700,
      ),
      decisionHash: `0xdec${seed.id.slice(3).toLowerCase()}91c`,
      policyHash: `0xpol${DEMO_POLICY_VERSION
        .replace(/\D/g, "")
        .padEnd(10, "0")}${index}c`,
      modelVersion: DEMO_MODEL_VERSION,
      featureVersion: DEMO_FEATURE_VERSION,
    };
  });
}
