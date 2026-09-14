import type {
  DemoActivityEvent,
  DemoApplication,
} from "../types";

import {
  daysAgo,
  minutesAgo,
} from "../utils";

export function createDemoActivity(
  applications: DemoApplication[],
): DemoActivityEvent[] {
  const primary = applications[0];

  if (!primary) {
    return [];
  }

  const events: DemoActivityEvent[] = [
    {
      id: "ACT-001",
      applicationId: primary.id,
      category: "evidence",
      title: "Evidence verified",
      description:
        "18 typed verified facts were attached to the application.",
      timestamp: minutesAgo(7),
      severity: "success",
      metadata: {
        facts: "18",
        verifier: "Attestcoin",
      },
    },

    {
      id: "ACT-002",
      applicationId: primary.id,
      category: "underwriting",
      title: "Credit profile scored",
      description:
        "The advisory underwriting model returned risk tier B.",
      timestamp: minutesAgo(8),
      severity: "success",
      metadata: {
        tier: "B",
        confidence: "91%",
      },
    },

    {
      id: "ACT-003",
      applicationId: primary.id,
      category: "policy",
      title: "RiskGuard checks passed",
      description:
        "Amount, LTV, freshness, confidence and liquidity checks passed.",
      timestamp: minutesAgo(10),
      severity: "success",
      metadata: {
        policy: "riskguard-v2.4",
      },
    },

    {
      id: "ACT-004",
      applicationId: "PL-7B00A9D1",
      category: "offer",
      title: "Offer generated",
      description:
        "A recommended 90-day borrowing offer is ready for review.",
      timestamp: minutesAgo(22),
      severity: "info",
      metadata: {
        amount: "3200",
      },
    },

    {
      id: "ACT-005",
      applicationId: "PL-13E7CA4B",
      category: "policy",
      title: "Application rejected",
      description:
        "The requested amount exceeded the configured policy envelope.",
      timestamp: daysAgo(7),
      severity: "warning",
      metadata: {
        reason:
          "REQUEST_AMOUNT_OUTSIDE_POLICY",
      },
    },

    {
      id: "ACT-006",
      category: "wallet",
      title: "Wallet synchronized",
      description:
        "Ethereum Sepolia wallet connection was refreshed.",
      timestamp: minutesAgo(34),
      severity: "info",
      metadata: {
        chain: "11155111",
      },
    },

    {
      id: "ACT-007",
      applicationId: "PL-921AC4EF",
      category: "offer",
      title: "Loan executed",
      description:
        "Application PL-921AC4EF reached the executed state.",
      timestamp: daysAgo(3),
      severity: "success",
      metadata: {
        amount: "1750",
      },
    },
  ];

  return events.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime(),
  );
}
