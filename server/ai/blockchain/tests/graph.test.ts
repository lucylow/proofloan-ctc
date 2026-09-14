import { describe, expect, it } from 'vitest';
import { CrossChainGraph } from '../crossChainGraph';

describe('cross chain graph',()=>{it('tracks degrees across chains',()=>{const g=new CrossChainGraph(); g.addEdge({from:'a',to:'b',chainId:'eth',value:1,timestampMs:0,verified:true}); g.addEdge({from:'a',to:'c',chainId:'poly',value:1,timestampMs:0,verified:true}); expect(g.degree('a')).toBe(2);});});
