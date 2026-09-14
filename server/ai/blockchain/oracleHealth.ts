export interface OracleHealth { proofBuilderUp:boolean; attestorQuorum:boolean; rpcHealthy:boolean; }
export function oracleHealthScore(h:OracleHealth){ return (Number(h.proofBuilderUp)+Number(h.attestorQuorum)+Number(h.rpcHealthy))/3; }
