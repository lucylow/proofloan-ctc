import type { MessageAttestation } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type DeliveryReceipt = {
  messageId: string;
  destinationChain: string;
  relayerId: string;
  success: boolean;
  destinationTxHash?: string;
  attempts: number;
  acknowledged: boolean;
  deliveryDigest: string;
};

export class DeliveryBook {
  private readonly receipts = new Map<string, DeliveryReceipt>();

  record(message: MessageAttestation, relayerId: string, success: boolean, txHash?: string): DeliveryReceipt {
    const previous = this.receipts.get(message.message.messageId);
    const receipt: DeliveryReceipt = {
      messageId: message.message.messageId,
      destinationChain: message.message.destinationChain,
      relayerId,
      success,
      destinationTxHash: txHash,
      attempts: (previous?.attempts ?? 0) + 1,
      acknowledged: previous?.acknowledged ?? false,
      deliveryDigest: sha256Hex({ messageId: message.message.messageId, relayerId, success, txHash, attempt: (previous?.attempts ?? 0) + 1 }),
    };
    this.receipts.set(receipt.messageId, receipt);
    return { ...receipt };
  }

  acknowledge(messageId: string, txHash: string): DeliveryReceipt {
    const current = this.receipts.get(messageId);
    if (!current) throw new Error(`No delivery receipt for ${messageId}.`);
    current.acknowledged = true;
    current.destinationTxHash = txHash;
    current.deliveryDigest = sha256Hex(current);
    return { ...current };
  }

  get(messageId: string): DeliveryReceipt | undefined { const value = this.receipts.get(messageId); return value ? { ...value } : undefined; }
}
