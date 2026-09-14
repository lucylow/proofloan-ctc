import type { AttestationCertificate, AttestorFault, AttestorRewardAllocation, MessageAttestation } from "@shared/attestors";

export type AttestorStoreSnapshot = {
  certificates: AttestationCertificate[];
  messages: MessageAttestation[];
  faults: AttestorFault[];
  rewards: AttestorRewardAllocation[];
};

export class AttestorStore {
  private readonly certificates = new Map<string, AttestationCertificate>();
  private readonly messages = new Map<string, MessageAttestation>();
  private readonly faults = new Map<string, AttestorFault>();
  private readonly rewards = new Map<string, AttestorRewardAllocation>();

  saveCertificate(certificate: AttestationCertificate): void {
    this.certificates.set(certificate.certificateId, structuredClone(certificate));
  }

  saveMessage(attestation: MessageAttestation): void {
    this.messages.set(attestation.message.messageId, structuredClone(attestation));
  }

  saveFault(fault: AttestorFault): void {
    this.faults.set(fault.faultId, structuredClone(fault));
  }

  saveReward(reward: AttestorRewardAllocation): void {
    const id = `${reward.feeId}:${reward.operatorId}:${reward.activity}`;
    this.rewards.set(id, structuredClone(reward));
  }

  certificate(id: string): AttestationCertificate | undefined {
    const value = this.certificates.get(id);
    return value ? structuredClone(value) : undefined;
  }

  message(id: string): MessageAttestation | undefined {
    const value = this.messages.get(id);
    return value ? structuredClone(value) : undefined;
  }

  certificatesByChain(chain: string): AttestationCertificate[] {
    return [...this.certificates.values()].filter(c => c.sourceChain === chain).map(c => structuredClone(c));
  }

  messagesByDestination(chain: string): MessageAttestation[] {
    return [...this.messages.values()].filter(m => m.message.destinationChain === chain).map(m => structuredClone(m));
  }

  faultsByOperator(operatorId: string): AttestorFault[] {
    return [...this.faults.values()].filter(f => f.operatorId === operatorId).map(f => structuredClone(f));
  }

  pendingRewards(operatorId?: string): AttestorRewardAllocation[] {
    return [...this.rewards.values()]
      .filter(r => (!operatorId || r.operatorId === operatorId) && (r.status === "accrued" || r.status === "claimable"))
      .map(r => structuredClone(r));
  }

  markRewardStatus(feeId: string, operatorId: string, activity: AttestorRewardAllocation["activity"], status: AttestorRewardAllocation["status"]): boolean {
    const id = `${feeId}:${operatorId}:${activity}`;
    const reward = this.rewards.get(id);
    if (!reward) return false;
    reward.status = status;
    return true;
  }

  snapshot(): AttestorStoreSnapshot {
    return {
      certificates: [...this.certificates.values()].map(v => structuredClone(v)),
      messages: [...this.messages.values()].map(v => structuredClone(v)),
      faults: [...this.faults.values()].map(v => structuredClone(v)),
      rewards: [...this.rewards.values()].map(v => structuredClone(v)),
    };
  }
}
