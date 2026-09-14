import type { MessageAttestation } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type InboxMessage = {
  messageId: string;
  validated: boolean;
  pending: boolean;
  retries: number;
  payloadHash: string;
};

export class AttestorInbox {
  private readonly records = new Map<string, InboxMessage>();

  accept(attestation: MessageAttestation): InboxMessage {
    const existing = this.records.get(attestation.message.messageId);
    if (existing) return { ...existing };
    const record: InboxMessage = {
      messageId: attestation.message.messageId,
      validated: attestation.quorum.supermajority,
      pending: !attestation.quorum.supermajority,
      retries: 0,
      payloadHash: sha256Hex(attestation.message.payloadHex),
    };
    this.records.set(record.messageId, record);
    return { ...record };
  }

  markExecutionReverted(messageId: string): InboxMessage {
    const record = this.records.get(messageId);
    if (!record) throw new Error("Unknown inbox message.");
    record.pending = true;
    record.retries += 1;
    return { ...record };
  }

  markExecuted(messageId: string): InboxMessage {
    const record = this.records.get(messageId);
    if (!record) throw new Error("Unknown inbox message.");
    record.pending = false;
    return { ...record };
  }

  pending(): InboxMessage[] { return [...this.records.values()].filter(x => x.pending).map(x => ({ ...x })); }
}
