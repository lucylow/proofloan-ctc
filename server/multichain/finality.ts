import { AttestcoinError } from "../attestcoin/errors";
import type { ResolvedSourceChain } from "./registry";

export type SourceObservation = {
  hash: string;
  blockNumber: number;
  head: number;
  confirmations: number;
  confirmationDepth: number;
  staleAfterBlocks: number;
  from?: string;
  to?: string | null;
  chain: ResolvedSourceChain["name"];
};

export function confirmationCount(head: number, blockNumber: number) {
  if (!Number.isInteger(head) || !Number.isInteger(blockNumber)) return 0;
  if (head < blockNumber) return 0;
  return head - blockNumber;
}

export function assertSourceFinality(
  observation: Pick<
    SourceObservation,
    "blockNumber" | "head" | "confirmationDepth" | "staleAfterBlocks" | "hash"
  >,
  requestId?: string,
) {
  const confirmations = confirmationCount(observation.head, observation.blockNumber);
  if (confirmations < observation.confirmationDepth) {
    throw new AttestcoinError(
      "ATTESTATION_PENDING",
      `Source transaction ${observation.hash} has ${confirmations} confirmation(s); ${observation.confirmationDepth} are required before live proof.`,
      { retriable: true, requestId },
    );
  }
  if (confirmations > observation.staleAfterBlocks) {
    throw new AttestcoinError(
      "STALE_PROOF",
      `Source transaction ${observation.hash} is ${confirmations} blocks behind the source head, which exceeds the ProofLoan live-proof window of ${observation.staleAfterBlocks} blocks.`,
      { requestId },
    );
  }
  return confirmations;
}

export function assertProofMatchesObservation(
  proofBlock: number,
  observedBlock: number,
  requestId?: string,
) {
  if (proofBlock !== observedBlock) {
    throw new AttestcoinError(
      "PROOF_VERIFICATION",
      `Attestcoin proof header ${proofBlock} does not match observed source block ${observedBlock}.`,
      { requestId },
    );
  }
}
