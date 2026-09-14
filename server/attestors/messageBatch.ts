import type { AttestorProfile, AttestorSignature, CrossChainMessage } from "@shared/attestors";
import { attestMessage } from "./message";

export function attestMessageBatch(messages: Array<{ message: CrossChainMessage; signatures: AttestorSignature[] }>, eligible: AttestorProfile[], requiredQuorumBps = 6667) {
  if (messages.length === 0) return [];
  if (messages.length > 100) throw new Error("Message batch exceeds application safety limit.");
  return messages.map(item => attestMessage(item.message, item.signatures, eligible, requiredQuorumBps));
}
