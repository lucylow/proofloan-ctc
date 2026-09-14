import { describe, expect, it } from 'vitest';
import { buildBlockchainFeatures } from '../featureBuilder';
import { parseBlockchainFeatureInput } from '../coerceFeatures';

describe('blockchain AI feature builder',()=>{it('builds bounded evidence features',()=>{const now=Date.now(); const f=buildBlockchainFeatures({nowMs:now,observations:[{chainId:'eth',blockNumber:1,txHash:'0x1',direction:'in',asset:'USDC',amount:'1000',timestampMs:now,verified:true,address:'0xabc'}],events:[]}); expect(f.proofCoverage).toBeGreaterThan(0); expect(f.proofCoverage).toBeLessThanOrEqual(1);});});

describe('parseBlockchainFeatureInput', () => {
  it('rejects non-object payloads', () => {
    expect(() => parseBlockchainFeatureInput(['not', 'features'])).toThrow(/must be an object/);
    expect(parseBlockchainFeatureInput({ proofCoverage: 0.8 }).proofCoverage).toBe(0.8);
  });
});

