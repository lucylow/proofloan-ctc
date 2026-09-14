import type { CrossChainMessage } from "@shared/attestors";
import { digestMessageInput, sha256Hex } from "./hash";

export function messageCommitment(message: CrossChainMessage): string {
  return digestMessageInput({
    messageId: message.messageId,
    originChain: message.originChain,
    destinationChain: message.destinationChain,
    emitter: message.emitter,
    payloadHex: message.payloadHex,
    nonce: message.nonce,
  });
}

export function payloadCommitment(payloadHex: string): string {
  return sha256Hex({ payloadHex });
}
