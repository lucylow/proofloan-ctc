export function verifiedEventWeight(verified:boolean,freshness:number){ return verified?Math.max(0,Math.min(1,freshness)):0; }
