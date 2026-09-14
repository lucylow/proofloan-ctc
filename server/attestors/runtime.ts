import type { AttestorProfile, AttestorServiceSnapshot, CrossChainMessage, MessageAttestation } from "@shared/attestors";
import { AttestorService } from "./service";
import { AttestorTelemetry } from "./telemetry";
import { AttestorWatchtower } from "./watchtower";
import { IncidentBook } from "./incident";
import { AttestorRewardLedger } from "./ledger";
import { AttestorClaimBook } from "./claims";
import { AttestorOutbox } from "./outbox";
import { AttestorInbox } from "./inbox";
import { DeliveryBook } from "./delivery";
import { MessagePipeline } from "./messagePipeline";
import { dashboardCards } from "./operatorViews";
import { diagnostics } from "./diagnostics";
import { policyHash } from "./policyHash";

export type AttestorRuntimeConfig = {
  environment: "cc3-testnet" | "cc3-mainnet";
  requiredQuorumBps?: number;
};

export class AttestorRuntime {
  readonly service: AttestorService;
  readonly telemetry = new AttestorTelemetry();
  readonly watchtower: AttestorWatchtower;
  readonly incidents = new IncidentBook();
  readonly rewards = new AttestorRewardLedger();
  readonly claims = new AttestorClaimBook();
  readonly outbox = new AttestorOutbox();
  readonly inbox = new AttestorInbox();
  readonly delivery = new DeliveryBook();

  constructor(profiles: AttestorProfile[], config: AttestorRuntimeConfig) {
    this.service = new AttestorService({ attestors: profiles, policy: {
      requiredQuorumBps: config.requiredQuorumBps ?? 6667,
      minimumAttestors: 2,
      minimumStakeAtomic: 1000n,
      maximumObservedAgeSeconds: 900,
      maximumFaultRateBps: 2000,
      allowProbationForQuorum: true,
    } });
    this.watchtower = new AttestorWatchtower(this.service.faults);
  }

  poll(): { snapshot: AttestorServiceSnapshot; alerts: ReturnType<AttestorWatchtower["scan"]>; diagnostics: ReturnType<typeof diagnostics> } {
    const profiles = this.service.registry.list("cc3-testnet");
    const health = this.service.health("cc3-testnet");
    this.telemetry.sample(health);
    const alerts = this.watchtower.scan(profiles, this.service.policy.requiredQuorumBps);
    if (alerts.some(a => a.severity === "critical")) this.incidents.open(this.service.faults.pending());
    return { snapshot: this.service.snapshot("cc3-testnet"), alerts, diagnostics: diagnostics(profiles) };
  }

  publish(message: Omit<CrossChainMessage, "messageId" | "createdAt" | "nonce"> & { senderNamespace: string }): CrossChainMessage {
    return this.outbox.publish(message);
  }

  attest(message: CrossChainMessage, signatures: Parameters<AttestorService["attestWrite"]>[0]["signatures"]): MessageAttestation {
    return this.service.attestWrite({
      environment: "cc3-testnet",
      originChain: message.originChain,
      destinationChain: message.destinationChain,
      emitter: message.emitter,
      payloadHex: message.payloadHex,
      nonce: message.nonce,
      signatures,
    });
  }

  deliver(attestation: MessageAttestation, relayerId = "demo-relayer-01"): ReturnType<DeliveryBook["record"]> {
    const accepted = this.inbox.accept(attestation);
    const success = accepted.validated;
    return this.delivery.record(attestation, relayerId, success, success ? `0xdeliver_${attestation.message.messageId.slice(-24)}` : undefined);
  }

  retry(messageId: string): void {
    this.inbox.markExecutionReverted(messageId);
    const pending = this.service.relay.choose(this.outbox.get(messageId)?.destinationChain ?? "");
    void pending;
  }

  operatorDashboard() {
    const profiles = this.service.registry.list("cc3-testnet");
    return {
      policyHash: policyHash(this.service.policy),
      operators: dashboardCards(profiles),
      telemetry: this.telemetry.recent(24),
      incidents: this.incidents.list(),
      rewards: this.rewards.list(),
      claims: this.claims.list(),
    };
  }

  riskScore(): number {
    const snapshot = this.service.snapshot("cc3-testnet");
    const quorumGap = Math.max(0, snapshot.requiredQuorumBps - snapshot.totalWeightBps);
    const healthGap = Math.max(0, snapshot.activeAttestors - snapshot.healthyAttestors);
    return Math.min(100, Math.round(quorumGap / 50 + healthGap * 10 + snapshot.pendingFaults * 12));
  }
}
