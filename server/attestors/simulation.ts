import type { AttestorProfile, AttestorObservation, AttestorSignature } from "@shared/attestors";
import { buildObservation } from "./observations";
import { digestAttestationInput, digestMessageInput } from "./hash";
import { deterministicTestSignature } from "./signatures";

export type SimulationScenario = {
  sourceChain: string;
  sourceBlock: number;
  blockHash: string;
  previousBlockHash: string;
  environment: "cc3-testnet" | "cc3-mainnet";
  disagreementOperatorIds?: string[];
  offlineOperatorIds?: string[];
};

export type SimulationResult = {
  observations: AttestorObservation[];
  signatures: AttestorSignature[];
  digest: string;
  expectedQuorumWeightBps: number;
};

export function simulateReadAttestation(profiles: AttestorProfile[], scenario: SimulationScenario, observedAt = new Date("2026-01-01T00:00:00.000Z")): SimulationResult {
  const disagreements = new Set(scenario.disagreementOperatorIds ?? []);
  const offline = new Set(scenario.offlineOperatorIds ?? []);
  const observations = profiles.filter(p => !offline.has(p.operatorId)).map(profile => buildObservation({
    operatorId: profile.operatorId,
    sourceChain: scenario.sourceChain,
    sourceBlock: scenario.sourceBlock,
    blockHash: disagreements.has(profile.operatorId) ? `0xwrong_${scenario.blockHash}` : scenario.blockHash,
    previousBlockHash: scenario.previousBlockHash,
    observedAt,
    maturityDelaySeconds: 0,
  }));
  const digest = digestAttestationInput({ environment: scenario.environment, sourceChain: scenario.sourceChain, sourceBlock: scenario.sourceBlock, blockHash: scenario.blockHash });
  const signatures = profiles.filter(p => !offline.has(p.operatorId) && !disagreements.has(p.operatorId)).map(p => deterministicTestSignature(p.operatorId, digest));
  const expectedQuorumWeightBps = profiles.filter(p => signatures.some(s => s.operatorId === p.operatorId)).reduce((sum, p) => sum + p.weightBps, 0);
  return { observations, signatures, digest, expectedQuorumWeightBps };
}

export function simulateMessageSignatures(profiles: AttestorProfile[], message: { messageId: string; originChain: string; destinationChain: string; emitter: string; payloadHex: string; nonce: string }): AttestorSignature[] {
  const digest = digestMessageInput(message);
  return profiles.map(p => deterministicTestSignature(p.operatorId, digest));
}
