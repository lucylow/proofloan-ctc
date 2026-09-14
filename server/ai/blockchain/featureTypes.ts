import type { BlockchainObservation, VerifiedChainEvent } from './blockchainTypes';

export interface AIBlockchainFeatures {
  walletAgeDays: number;
  transactionCount30d: number;
  transactionCount180d: number;
  activeDays30d: number;
  uniqueContracts30d: number;
  uniqueChains180d: number;
  inboundVolume30d: number;
  outboundVolume30d: number;
  netFlow30d: number;
  counterpartyDiversity: number;
  repaymentSignal: number;
  volatilitySignal: number;
  liquiditySignal: number;
  gasDisciplineSignal: number;
  proofCoverage: number;
  freshnessScore: number;
  crossChainConsistency: number;
  anomalyScore: number;
  evidenceDensity: number;
}

export interface FeatureContext {
  observations: BlockchainObservation[];
  events: VerifiedChainEvent[];
  nowMs: number;
}
