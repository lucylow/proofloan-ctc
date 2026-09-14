import type { AttestationCertificate, AttestorFault, AttestorRewardAllocation } from "@shared/attestors";

export interface AttestorPersistence {
  saveCertificate(certificate: AttestationCertificate): Promise<void>;
  saveFault(fault: AttestorFault): Promise<void>;
  saveReward(reward: AttestorRewardAllocation): Promise<void>;
  listCertificates(sourceChain?: string): Promise<AttestationCertificate[]>;
  listFaults(operatorId?: string): Promise<AttestorFault[]>;
  listRewards(operatorId?: string): Promise<AttestorRewardAllocation[]>;
}

export class MemoryAttestorPersistence implements AttestorPersistence {
  private readonly certificates: AttestationCertificate[] = [];
  private readonly faults: AttestorFault[] = [];
  private readonly rewards: AttestorRewardAllocation[] = [];
  async saveCertificate(certificate: AttestationCertificate) { this.certificates.push(structuredClone(certificate)); }
  async saveFault(fault: AttestorFault) { this.faults.push(structuredClone(fault)); }
  async saveReward(reward: AttestorRewardAllocation) { this.rewards.push(structuredClone(reward)); }
  async listCertificates(sourceChain?: string) { return this.certificates.filter(c => !sourceChain || c.sourceChain === sourceChain).map(c => structuredClone(c)); }
  async listFaults(operatorId?: string) { return this.faults.filter(f => !operatorId || f.operatorId === operatorId).map(f => structuredClone(f)); }
  async listRewards(operatorId?: string) { return this.rewards.filter(r => !operatorId || r.operatorId === operatorId).map(r => structuredClone(r)); }
}
