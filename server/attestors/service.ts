import type {
  AttestationCertificate,
  AttestorProfile,
  AttestorRewardAllocation,
  AttestorServiceSnapshot,
  CrossChainMessage,
  MessageAttestation,
  VerifiedCrossChainFact,
  AttestorSignature,
} from "@shared/attestors";
import { AttestorRegistry } from "./registry";
import { AttestorAuditTrail } from "./audit";
import { AttestorMetrics } from "./metrics";
import { FaultBook } from "./faults";
import { SlashingEngine } from "./slashing";
import { CheckpointBook } from "./checkpoints";
import { AvailabilityBook } from "./availability";
import { MemoryAttestorPersistence, type AttestorPersistence } from "./persistence";
import { defaultAttestorPolicy, assertPolicySatisfied, eligibleByPolicy, type AttestorPolicy } from "./policy";
import { buildAttestationCertificate, type ConsensusInput } from "./consensus";
import { verifyReadProof } from "./readProof";
import { attestMessage, createCrossChainMessage } from "./message";
import { allocateAttestorRewards } from "./rewards";
import { buildHealth } from "./health";
import { AttestorRelayRouter, type RelayerEndpoint } from "./relay";

export class AttestorService {
  readonly registry: AttestorRegistry;
  readonly audit = new AttestorAuditTrail();
  readonly metrics = new AttestorMetrics();
  readonly faults: FaultBook;
  readonly slashing: SlashingEngine;
  readonly checkpoints = new CheckpointBook();
  readonly availability = new AvailabilityBook();
  readonly persistence: AttestorPersistence;
  readonly policy: AttestorPolicy;
  readonly relay: AttestorRelayRouter;

  constructor(input: {
    attestors: AttestorProfile[];
    relayers?: RelayerEndpoint[];
    policy?: AttestorPolicy;
    persistence?: AttestorPersistence;
  }) {
    this.registry = new AttestorRegistry(input.attestors);
    this.faults = new FaultBook();
    this.slashing = new SlashingEngine(this.faults);
    this.persistence = input.persistence ?? new MemoryAttestorPersistence();
    this.policy = input.policy ?? defaultAttestorPolicy;
    this.relay = new AttestorRelayRouter(input.relayers ?? [
      { relayerId: "demo-relayer-01", destinationChains: ["ethereum-mainnet", "ethereum-sepolia", "polygon-amoy"], enabled: true, priority: 1 },
      { relayerId: "demo-relayer-02", destinationChains: ["ethereum-mainnet", "ethereum-sepolia"], enabled: true, priority: 2 },
    ]);
  }

  eligible(environment: AttestorProfile["environment"], sourceChain?: string): AttestorProfile[] {
    const candidates = this.registry.active(environment, sourceChain);
    const filtered = eligibleByPolicy(candidates, this.policy);
    assertPolicySatisfied(filtered, this.policy);
    return filtered;
  }

  attestRead(input: ConsensusInput): AttestationCertificate {
    const certificate = buildAttestationCertificate(input, new Date());
    this.metrics.observations += input.observations.length;
    this.metrics.finalized += input.observations.filter(o => new Date(o.maturityAt).getTime() <= Date.now()).length;
    this.metrics.certificates += 1;
    this.checkpoints.commit(certificate);
    this.audit.append("attestation.aggregated", {
      chain: certificate.sourceChain,
      block: certificate.sourceBlock,
      signers: certificate.quorum.signerCount,
      quorumBps: certificate.quorum.observedWeightBps,
      certificateId: certificate.certificateId,
    });
    void this.persistence.saveCertificate(certificate);
    return certificate;
  }

  verifyFact(certificate: AttestationCertificate, envelope: Parameters<typeof verifyReadProof>[0]): VerifiedCrossChainFact {
    const fact = verifyReadProof(envelope, certificate);
    this.metrics.readProofs += 1;
    this.audit.append("continuity.verified", {
      chain: fact.sourceChain,
      block: fact.sourceBlock,
      factId: fact.factId,
      attestors: fact.attestorCount,
    });
    return fact;
  }

  attestWrite(input: {
    environment: AttestorProfile["environment"];
    originChain: string;
    destinationChain: string;
    emitter: string;
    payloadHex: string;
    nonce: string;
    signatures: AttestorSignature[];
  }): MessageAttestation {
    const message: CrossChainMessage = createCrossChainMessage({
      originChain: input.originChain,
      destinationChain: input.destinationChain,
      emitter: input.emitter,
      payloadHex: input.payloadHex,
      acknowledgementRequired: false,
      nonce: input.nonce,
    });
    const eligible = this.eligible(input.environment);
    const attestation = attestMessage(message, input.signatures, eligible, this.policy.requiredQuorumBps);
    this.metrics.messageAttestations += 1;
    this.audit.append("message.signed", {
      messageId: message.messageId,
      originChain: message.originChain,
      destinationChain: message.destinationChain,
      signerCount: attestation.quorum.signerCount,
      quorumBps: attestation.quorum.observedWeightBps,
    });
    return attestation;
  }

  routeMessage(attestation: MessageAttestation): Record<string, unknown> {
    const relayer = this.relay.choose(attestation.message.destinationChain);
    const intent = this.relay.buildRelayIntent(attestation.message, attestation, relayer);
    this.metrics.relays += 1;
    this.audit.append("delivery.carried", { messageId: attestation.message.messageId, relayerId: relayer.relayerId, destinationChain: relayer.destinationChains[0] });
    return intent;
  }

  accrueRewards(feeId: string, amountAtomic: bigint, activity: "proof-verification" | "message-carry" | "both", environment: AttestorProfile["environment"]): AttestorRewardAllocation[] {
    const attestors = this.registry.active(environment);
    const rewards = allocateAttestorRewards({ feeId, amountAtomic, activity, attestors });
    for (const reward of rewards) {
      this.metrics.recordReward(BigInt(reward.amountAtomic));
      void this.persistence.saveReward(reward);
      this.audit.append("reward.accrued", { feeId, operatorId: reward.operatorId, amountAtomic: reward.amountAtomic, activity });
    }
    return rewards;
  }

  reportFault(input: Parameters<FaultBook["propose"]>[0]) {
    const fault = this.faults.propose(input);
    this.metrics.faults += 1;
    void this.persistence.saveFault(fault);
    this.audit.append("fault.detected", { faultId: fault.faultId, operatorId: fault.operatorId, category: fault.category });
    return fault;
  }

  confirmFault(faultId: string, slashBps: number) {
    const fault = this.faults.confirm(faultId, slashBps);
    this.metrics.slashes += 1;
    this.audit.append("slash.confirmed", { faultId, operatorId: fault.operatorId, slashBps });
    return fault;
  }

  health(environment: AttestorProfile["environment"]): ReturnType<typeof buildHealth>[] {
    return this.registry.list(environment).map(profile => buildHealth(profile));
  }

  snapshot(environment: AttestorProfile["environment"]): AttestorServiceSnapshot {
    const profiles = this.registry.list(environment);
    const eligible = profiles.filter(p => p.status === "active" || p.status === "probation");
    const healthyAttestors = this.health(environment).filter(item => item.available).length;
    return {
      environment,
      eligibleAttestors: eligible.length,
      activeAttestors: profiles.filter(p => p.status === "active").length,
      totalStakeAtomic: profiles.reduce((sum, p) => sum + BigInt(p.stakeAtomic), 0n).toString(),
      totalWeightBps: profiles.reduce((sum, p) => sum + p.weightBps, 0),
      requiredQuorumBps: this.policy.requiredQuorumBps,
      healthyAttestors,
      pendingFaults: this.faults.pending().length,
      pendingRewardsAtomic: "0",
      latestAttestationByChain: this.checkpoints.snapshot(),
    };
  }
}
