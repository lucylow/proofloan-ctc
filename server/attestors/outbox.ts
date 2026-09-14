import type { CrossChainMessage } from "@shared/attestors";
import { createCrossChainMessage } from "./message";

export class AttestorOutbox {
  private readonly messages = new Map<string, CrossChainMessage>();
  private readonly counters = new Map<string, bigint>();

  publish(input: Omit<CrossChainMessage, "messageId" | "createdAt" | "nonce"> & { senderNamespace: string }): CrossChainMessage {
    const nonce = this.counters.get(input.senderNamespace) ?? 0n;
    this.counters.set(input.senderNamespace, nonce + 1n);
    const message = createCrossChainMessage({ ...input, nonce: nonce.toString() });
    this.messages.set(message.messageId, message);
    return structuredClone(message);
  }

  get(messageId: string): CrossChainMessage | undefined { const value = this.messages.get(messageId); return value ? structuredClone(value) : undefined; }
  list(): CrossChainMessage[] { return [...this.messages.values()].map(m => structuredClone(m)); }
}
