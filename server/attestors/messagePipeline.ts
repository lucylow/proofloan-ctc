import type { AttestorProfile, AttestorSignature, CrossChainMessage, MessageAttestation } from "@shared/attestors";
import { attestMessage } from "./message";

export type MessageStage = "draft" | "signed" | "carried" | "delivered" | "acknowledged" | "pending" | "rejected";
export type MessageState = { stage: MessageStage; message: CrossChainMessage; attestation?: MessageAttestation; attempts: number; updatedAt: string; reason?: string };

export class MessagePipeline {
  private state: MessageState;
  constructor(message: CrossChainMessage) { this.state = { stage: "draft", message: structuredClone(message), attempts: 0, updatedAt: new Date().toISOString() }; }
  sign(signatures: AttestorSignature[], eligible: AttestorProfile[]): MessageState { const attestation = attestMessage(this.state.message, signatures, eligible); this.state = { ...this.state, stage: "signed", attestation, updatedAt: new Date().toISOString() }; return structuredClone(this.state); }
  markCarried(): MessageState { if (!this.state.attestation) throw new Error("Message must be attested before carrying."); this.state = { ...this.state, stage: "carried", attempts: this.state.attempts + 1, updatedAt: new Date().toISOString() }; return structuredClone(this.state); }
  markDelivered(): MessageState { if (this.state.stage !== "carried" && this.state.stage !== "pending") throw new Error("Message is not in a deliverable state."); this.state = { ...this.state, stage: "delivered", updatedAt: new Date().toISOString() }; return structuredClone(this.state); }
  markPending(reason: string): MessageState { this.state = { ...this.state, stage: "pending", reason: reason.slice(0, 256), attempts: this.state.attempts + 1, updatedAt: new Date().toISOString() }; return structuredClone(this.state); }
  markAcknowledged(): MessageState { if (this.state.stage !== "delivered") throw new Error("Message must be delivered before acknowledgement."); this.state = { ...this.state, stage: "acknowledged", updatedAt: new Date().toISOString() }; return structuredClone(this.state); }
}
