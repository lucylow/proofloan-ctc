import type { CrossChainMessage, MessageAttestation } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type RelayAttempt = {
  attemptId: string;
  messageId: string;
  relayerId: string;
  destinationChain: string;
  submittedAt: string;
  success: boolean;
  transactionHash?: string;
  error?: string;
};

export type RelayerEndpoint = {
  relayerId: string;
  destinationChains: string[];
  enabled: boolean;
  priority: number;
};

export class AttestorRelayRouter {
  constructor(private readonly relayers: RelayerEndpoint[]) {}

  choose(destinationChain: string): RelayerEndpoint {
    const available = this.relayers.filter(r => r.enabled && r.destinationChains.includes(destinationChain)).sort((a, b) => a.priority - b.priority);
    if (available.length === 0) throw new Error(`No relayer is available for ${destinationChain}.`);
    return available[0];
  }

  buildRelayIntent(message: CrossChainMessage, attestation: MessageAttestation, relayer: RelayerEndpoint): Record<string, unknown> {
    return {
      relayId: `relay_${sha256Hex({ message: message.messageId, attestation: attestation.digest, relayer: relayer.relayerId }).slice(2, 26)}`,
      messageId: message.messageId,
      destinationChain: message.destinationChain,
      relayerId: relayer.relayerId,
      aggregateSignature: attestation.aggregateSignature,
      digest: attestation.digest,
    };
  }
}
