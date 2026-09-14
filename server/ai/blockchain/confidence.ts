export function blockchainConfidenceFromUncertainty(u:number){ return Math.max(0,Math.min(1,1-u)); }
