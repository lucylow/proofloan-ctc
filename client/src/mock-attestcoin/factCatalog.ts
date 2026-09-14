import type { MockFactEvent } from "./types";

export const MOCK_FACT_EVENTS: MockFactEvent[] = [
  "REPAYMENT",
  "COLLATERAL_DEPOSIT",
  "LATE_PAYMENT",
  "LIQUIDITY",
  "WALLET_ACTIVITY",
];

export const MOCK_FACT_LABELS: Record<MockFactEvent, string> = {
  REPAYMENT: "Repayment",
  COLLATERAL_DEPOSIT: "Collateral deposit",
  LATE_PAYMENT: "Late payment",
  LIQUIDITY: "Liquidity event",
  WALLET_ACTIVITY: "Wallet activity",
};
