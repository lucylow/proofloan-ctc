import { describe, expect, it } from 'vitest';
import { scoreVerifiedBehavior } from '../proofAwareScoring';

describe('proof aware score',()=>{it('abstains on missing proof coverage',()=>{const r=scoreVerifiedBehavior({walletAgeDays:0,transactionCount30d:0,transactionCount180d:0,activeDays30d:0,uniqueContracts30d:0,uniqueChains180d:0,inboundVolume30d:0,outboundVolume30d:0,netFlow30d:0,counterpartyDiversity:0,repaymentSignal:0,volatilitySignal:0,liquiditySignal:0,gasDisciplineSignal:0,proofCoverage:0,freshnessScore:0,crossChainConsistency:0,anomalyScore:0,evidenceDensity:0}); expect(r.abstain).toBe(true);});});
