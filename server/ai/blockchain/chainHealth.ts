export interface ChainHealth { headLagBlocks:number; rpcLatencyMs:number; errorRate:number; }
export function chainHealthScore(h:ChainHealth){ const lag=Math.min(1,h.headLagBlocks/20); const latency=Math.min(1,h.rpcLatencyMs/2000); return Math.max(0,1-(0.4*lag+0.3*latency+0.3*Math.min(1,h.errorRate))); }
