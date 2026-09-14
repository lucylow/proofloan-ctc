export function flowImbalance(inbound:number,outbound:number){ const total=Math.abs(inbound)+Math.abs(outbound); return total?Math.abs(inbound-outbound)/total:0; }
