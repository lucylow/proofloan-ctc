import type { AIBlockchainFeatures, FeatureContext } from './featureTypes';
import { countWalletActivity, activeDays } from './walletActivity';
import { walletAgeDays } from './walletAge';
import { chainDiversity } from './chainDiversity';
import { directionalVolume } from './volume';
import { uniqueContracts } from './contractDiversity';
import { proofCoverage } from './proofCoverage';
import { freshnessScore } from './freshness';
import { counterpartyDiversity } from './counterparties';
import { liquiditySignal } from './liquidityBehavior';
import { crossChainConsistency } from './crossChainConsistency';
import { evidenceDensity } from './evidenceDensity';
import { repaymentSignal } from './repaymentSignal';
import { clamp01 } from './normalization';

export function buildBlockchainFeatures(ctx: FeatureContext): AIBlockchainFeatures {
  const ageStart = Math.min(...ctx.observations.map(o=>o.timestampMs), ctx.nowMs);
  const volume = directionalVolume(ctx.observations);
  const v = Math.abs(volume.net);
  return {
    walletAgeDays: walletAgeDays(ageStart, ctx.nowMs),
    transactionCount30d: countWalletActivity(ctx.observations, ctx.nowMs, 30),
    transactionCount180d: countWalletActivity(ctx.observations, ctx.nowMs, 180),
    activeDays30d: activeDays(ctx.observations, ctx.nowMs, 30),
    uniqueContracts30d: uniqueContracts(ctx.events),
    uniqueChains180d: new Set(ctx.observations.map(o=>o.chainId)).size,
    inboundVolume30d: volume.inbound,
    outboundVolume30d: volume.outbound,
    netFlow30d: volume.net,
    counterpartyDiversity: counterpartyDiversity(ctx.observations),
    repaymentSignal: repaymentSignal(ctx.events),
    volatilitySignal: clamp01(v / 100_000),
    liquiditySignal: liquiditySignal(ctx.observations),
    gasDisciplineSignal: 0.5,
    proofCoverage: proofCoverage(ctx.observations, ctx.events),
    freshnessScore: freshnessScore(ctx.observations, ctx.events, ctx.nowMs),
    crossChainConsistency: crossChainConsistency(ctx.observations),
    anomalyScore: 0,
    evidenceDensity: evidenceDensity(ctx.observations, ctx.events),
  };
}
