import type { AttestorObservation, AttestorSignature } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type FaultEvidenceBundle = { observation: AttestorObservation; conflictingObservation?: AttestorObservation; signatures: AttestorSignature[]; digest: string };

export function buildFaultEvidence(observation: AttestorObservation, signatures: AttestorSignature[], conflictingObservation?: AttestorObservation): FaultEvidenceBundle {
  return { observation: structuredClone(observation), conflictingObservation: conflictingObservation ? structuredClone(conflictingObservation) : undefined, signatures: signatures.map(s => ({ ...s })), digest: sha256Hex({ observation, conflictingObservation, signatures }) };
}
