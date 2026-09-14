export interface BlockchainAIHealth { rpc:boolean; proofBuilder:boolean; attestors:boolean; model:boolean; }
export function healthScore(h:BlockchainAIHealth){ return (Number(h.rpc)+Number(h.proofBuilder)+Number(h.attestors)+Number(h.model))/4; }
