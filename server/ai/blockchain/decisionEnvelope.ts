export interface BlockchainDecisionEnvelope { version:string; score:number; confidence:number; reasons:string[]; evidenceMode:'verified'|'mock'; fingerprint:string; }
