import type { AttestationCertificate } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type DeliveryAcknowledgement = { messageId: string; destinationChain: string; txHash: string; proofDigest: string; verified: boolean; createdAt: string };

export function verifyDeliveryAcknowledgement(input: { messageId: string; destinationChain: string; txHash: string; certificate: AttestationCertificate; emittedMessageId: string }): DeliveryAcknowledgement {
  const verified = input.messageId === input.emittedMessageId && Boolean(input.txHash.startsWith("0x")) && input.certificate.sourceChain === input.destinationChain;
  return {
    messageId: input.messageId,
    destinationChain: input.destinationChain,
    txHash: input.txHash,
    proofDigest: sha256Hex({ messageId: input.messageId, destinationChain: input.destinationChain, txHash: input.txHash, certificateId: input.certificate.certificateId }),
    verified,
    createdAt: new Date().toISOString(),
  };
}
