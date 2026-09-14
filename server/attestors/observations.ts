import { randomUUID } from "node:crypto";
import type { AttestorObservation } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type ObservationInput = {
  operatorId: string;
  sourceChain: string;
  sourceBlock: number;
  blockHash: string;
  previousBlockHash: string;
  observedAt?: Date;
  maturityDelaySeconds: number;
};

export function buildObservation(input: ObservationInput): AttestorObservation {
  const observedAt = input.observedAt ?? new Date();
  const maturityAt = new Date(observedAt.getTime() + Math.max(0, input.maturityDelaySeconds) * 1000);
  return {
    observationId: `obs_${randomUUID().replaceAll("-", "")}`,
    operatorId: input.operatorId,
    sourceChain: input.sourceChain,
    sourceBlock: input.sourceBlock,
    blockHash: input.blockHash,
    previousBlockHash: input.previousBlockHash,
    observedAt: observedAt.toISOString(),
    maturityAt: maturityAt.toISOString(),
    finalized: false,
  };
}

export function observationDigest(observation: AttestorObservation): string {
  return sha256Hex(observation);
}
