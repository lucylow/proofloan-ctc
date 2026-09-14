import type { AttestationCertificate, AttestorSignature, CrossChainMessage, MessageAttestation } from "@shared/attestors";

export interface AttestorProtocolAdapter {
  readAttestation(sourceChain: string, sourceBlock: number): Promise<AttestationCertificate>;
  submitMessageAttestation(message: CrossChainMessage): Promise<MessageAttestation>;
  verifyAggregateSignature(digest: string, signatures: AttestorSignature[], aggregateSignature?: string): Promise<boolean>;
  getAttestorSet(environment: "cc3-testnet" | "cc3-mainnet"): Promise<Array<{ operatorId: string; weightBps: number; stakeAtomic: string; status: string }>>;
}

export class UnconfiguredAttestorProtocolAdapter implements AttestorProtocolAdapter {
  async readAttestation(): Promise<AttestationCertificate> { throw new Error("External Attestor protocol adapter is not configured."); }
  async submitMessageAttestation(): Promise<MessageAttestation> { throw new Error("External Attestor message adapter is not configured."); }
  async verifyAggregateSignature(): Promise<boolean> { throw new Error("External Attestor signature adapter is not configured."); }
  async getAttestorSet(): Promise<Array<{ operatorId: string; weightBps: number; stakeAtomic: string; status: string }>> { throw new Error("External Attestor registry adapter is not configured."); }
}
