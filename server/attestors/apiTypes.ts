import type { AttestorActivity, AttestorProfile, AttestorServiceSnapshot, AttestorSignature, CrossChainMessage, MessageAttestation } from "@shared/attestors";

export type RegisterAttestorRequest = Partial<AttestorProfile> & { operatorId: string; environment: "cc3-testnet" | "cc3-mainnet"; chains: string[] };
export type RegisterAttestorResponse = { accepted: boolean; operatorId: string; reason?: string };
export type HeartbeatRequest = { operatorId: string; observedAt: string; latencyMs: number; availability: boolean };
export type HeartbeatResponse = { accepted: boolean; nextHeartbeatAt: string; operatorId: string };
export type SignReadRequest = { environment: "cc3-testnet" | "cc3-mainnet"; sourceChain: string; sourceBlock: number; blockHash: string; previousBlockHash: string; digest: string };
export type SignReadResponse = { operatorId: string; signature: AttestorSignature };
export type SignMessageRequest = { message: CrossChainMessage; digest: string };
export type SignMessageResponse = { operatorId: string; signature: AttestorSignature };
export type AttestorSummaryResponse = AttestorServiceSnapshot & { activities: AttestorActivity[] };
export type AttestorListResponse = { items: Array<Omit<AttestorProfile, "signingAddress" | "blsPublicKey">> };
export type MessageAttestationResponse = MessageAttestation;
