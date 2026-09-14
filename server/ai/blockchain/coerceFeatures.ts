import type { AIBlockchainFeatures } from "./featureTypes";
import { safeNumber } from "./normalization";

export const EMPTY_BLOCKCHAIN_FEATURES: AIBlockchainFeatures = {
  walletAgeDays: 0,
  transactionCount30d: 0,
  transactionCount180d: 0,
  activeDays30d: 0,
  uniqueContracts30d: 0,
  uniqueChains180d: 0,
  inboundVolume30d: 0,
  outboundVolume30d: 0,
  netFlow30d: 0,
  counterpartyDiversity: 0,
  repaymentSignal: 0,
  volatilitySignal: 0,
  liquiditySignal: 0,
  gasDisciplineSignal: 0,
  proofCoverage: 0,
  freshnessScore: 0,
  crossChainConsistency: 0,
  anomalyScore: 0,
  evidenceDensity: 0,
};

export function parseBlockchainFeatureInput(input: unknown): AIBlockchainFeatures {
  if (input == null) return coerceBlockchainFeatures(undefined);
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Blockchain features must be an object of numeric signals.");
  }
  const numeric: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" && Number.isFinite(value)) numeric[key] = value;
  }
  return coerceBlockchainFeatures(numeric);
}

export function coerceBlockchainFeatures(input: Record<string, number> | AIBlockchainFeatures | undefined): AIBlockchainFeatures {
  const source = input ?? {};
  return {
    walletAgeDays: safeNumber(source.walletAgeDays),
    transactionCount30d: safeNumber(source.transactionCount30d),
    transactionCount180d: safeNumber(source.transactionCount180d),
    activeDays30d: safeNumber(source.activeDays30d),
    uniqueContracts30d: safeNumber(source.uniqueContracts30d),
    uniqueChains180d: safeNumber(source.uniqueChains180d),
    inboundVolume30d: safeNumber(source.inboundVolume30d),
    outboundVolume30d: safeNumber(source.outboundVolume30d),
    netFlow30d: safeNumber(source.netFlow30d),
    counterpartyDiversity: safeNumber(source.counterpartyDiversity),
    repaymentSignal: safeNumber(source.repaymentSignal),
    volatilitySignal: safeNumber(source.volatilitySignal),
    liquiditySignal: safeNumber(source.liquiditySignal),
    gasDisciplineSignal: safeNumber(source.gasDisciplineSignal),
    proofCoverage: safeNumber(source.proofCoverage),
    freshnessScore: safeNumber(source.freshnessScore),
    crossChainConsistency: safeNumber(source.crossChainConsistency),
    anomalyScore: safeNumber(source.anomalyScore),
    evidenceDensity: safeNumber(source.evidenceDensity),
  };
}
