import type { SourceEvent } from "@shared/readability";
import { ReadabilityError, isValidTimestamp } from "./errors";

export type AttestationSnapshot = {
  chainKey: number;
  sourceBlock: number;
  sourceBlockHash: string;
  attestedAt: string;
  validUntil: string;
};

export function assertAttestationMatches(snapshot: AttestationSnapshot, event: SourceEvent): void {
  if (!isValidTimestamp(snapshot.attestedAt) || !isValidTimestamp(snapshot.validUntil)) {
    throw new ReadabilityError("ATTESTATION", "Attestation timestamps are invalid.");
  }
  if (snapshot.sourceBlock !== event.blockNumber) {
    throw new ReadabilityError("ATTESTATION", "Attestation block does not match the source event.");
  }
  if (snapshot.sourceBlockHash.toLowerCase() !== event.blockHash.toLowerCase()) {
    throw new ReadabilityError("ATTESTATION", "Attestation block hash does not match the source event.");
  }
  if (Date.parse(snapshot.validUntil) <= Date.now()) {
    throw new ReadabilityError("ATTESTATION", "Attestation expired before proof construction.", true);
  }
}
