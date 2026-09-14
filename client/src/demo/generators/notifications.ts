import type {
  DemoNotification,
} from "../types";

import {
  minutesAgo,
  hoursAgo,
} from "../utils";

export function createDemoNotifications(): DemoNotification[] {
  return [
    {
      id: "N-001",
      title: "Evidence verified",
      description:
        "Your latest application now has sufficient verified evidence.",
      timestamp: minutesAgo(7),
      read: false,
      severity: "success",
    },

    {
      id: "N-002",
      title: "Offer available",
      description:
        "A recommended USDC borrowing offer is ready for review.",
      timestamp: minutesAgo(23),
      read: false,
      severity: "info",
    },

    {
      id: "N-003",
      title: "Evidence aging",
      description:
        "Two evidence records are approaching the freshness threshold.",
      timestamp: hoursAgo(4),
      read: false,
      severity: "warning",
    },

    {
      id: "N-004",
      title: "Wallet synchronized",
      description:
        "Ethereum Sepolia wallet connection is active.",
      timestamp: hoursAgo(8),
      read: true,
      severity: "success",
    },

    {
      id: "N-005",
      title: "Policy review required",
      description:
        "One application needs manual review because of amount constraints.",
      timestamp: hoursAgo(18),
      read: true,
      severity: "warning",
    },
  ];
}
