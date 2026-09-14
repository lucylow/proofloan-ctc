import type {
  DemoApplication,
  DemoDecision,
  DemoDecisionReason,
} from "../types";

import {
  DEMO_FEATURE_VERSION,
  DEMO_MODEL_VERSION,
} from "../constants";

import {
  hoursAgo,
} from "../utils";

export function createDemoDecisions(
  applications: DemoApplication[],
): DemoDecision[] {
  return applications.map(
    (application, index) => {
      const negative =
        application.riskTier === "D" ||
        application.riskTier === "E";

      const reasons: DemoDecisionReason[] = [
        {
          code: "STRONG_REPAYMENT_HISTORY",
          label: "Strong repayment history",
          severity: "positive",
          contribution: negative ? 4 : 18,
        },
        {
          code: "WALLET_MATURITY",
          label: "Mature wallet history",
          severity: "positive",
          contribution: application.walletAgeDays > 180 ? 12 : 5,
        },
        {
          code: "EVIDENCE_FRESHNESS",
          label: "Fresh evidence coverage",
          severity:
            application.evidenceFreshness >= 85
              ? "positive"
              : "negative",
          contribution:
            application.evidenceFreshness >= 85
              ? 11
              : -9,
        },
        {
          code: "LEVERAGE",
          label: "Leverage within target range",
          severity:
            application.leverageRatio < 0.45
              ? "positive"
              : "negative",
          contribution:
            application.leverageRatio < 0.45
              ? 10
              : -12,
        },
      ];

      if (negative) {
        reasons.push({
          code: "HIGH_REQUEST_AMOUNT",
          label: "Requested amount requires review",
          severity: "negative",
          contribution: -22,
        });
      }

      return {
        id: `DEC-${String(index + 1).padStart(
          4,
          "0",
        )}`,
        applicationId: application.id,
        riskTier: application.riskTier,
        probability30d:
          application.riskTier === "A"
            ? 2.7
            : application.riskTier === "B"
              ? 4.8
              : application.riskTier === "C"
                ? 8.7
                : 16.4,
        probability90d:
          application.riskTier === "A"
            ? 5.1
            : application.riskTier === "B"
              ? 8.1
              : application.riskTier === "C"
                ? 13.6
                : 25.7,
        confidence: application.confidence,
        modelVersion: DEMO_MODEL_VERSION,
        featureVersion: DEMO_FEATURE_VERSION,
        policyHash: application.policyHash,
        generatedAt: hoursAgo(index * 3 + 1),
        reasons,
        policyChecks: {
          amount:
            application.amount <= 5000,
          ltv:
            application.loanToValue <= 0.65,
          freshness:
            application.evidenceFreshness >= 70,
          confidence:
            application.confidence >= 80,
          liquidity:
            application.riskTier !== "E",
        },
      };
    },
  );
}
