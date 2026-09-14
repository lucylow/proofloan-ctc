export type GasCostModel = {
  baseCtc: number;
  continuityHashCtc: number;
  maximalDecodeCtc: number;
  maxTransactionBytes: number;
};

export type GasEstimateInput = {
  continuityHashCount: number;
  merkleSiblingCount: number;
  encodedTransactionBytes: number;
  gasPriceCtc?: number;
};

export type GasEstimate = {
  modelVersion: string;
  /** Official CTC estimate: base + continuity hashes only. */
  officialCtc: number;
  /** Planning total including unofficial Merkle / decode heuristics. */
  estimatedCtc: number;
  continuityCtc: number;
  baseCtc: number;
  merkleComplexityCtc: number;
  decodeRiskCtc: number;
  transactionBytes: number;
  continuityHashCount: number;
  merkleSiblingCount: number;
  safe: boolean;
  reasons: string[];
};

export type GasRisk = "low" | "medium" | "high" | "blocked";

export type OptimizationDecision = {
  action: "submit-now" | "wait" | "reject" | "manual-review";
  risk: GasRisk;
  priority: number;
  estimatedCtc: number;
  officialCtc: number;
  continuityHashCount: number;
  reasons: string[];
  recommendations: string[];
};

export type ReadabilityCostBudget = {
  perQueryCtc: number;
  perMinuteCtc: number;
  perHourCtc: number;
  maxOutstandingQueries: number;
};

export type CostLedgerEntry = {
  queryId: string;
  estimatedCtc: number;
  actualCtc?: number;
  timestamp: string;
  status: "reserved" | "settled" | "released";
};
