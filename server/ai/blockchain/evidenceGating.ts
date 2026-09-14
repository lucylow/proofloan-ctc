export interface EvidenceGate { minCoverage:number; minFreshness:number; minAttestorConfidence:number; }
export function canUseBlockchainEvidence(input:{coverage:number;freshness:number;attestorConfidence:number}, gate:EvidenceGate){ return input.coverage>=gate.minCoverage && input.freshness>=gate.minFreshness && input.attestorConfidence>=gate.minAttestorConfidence; }
