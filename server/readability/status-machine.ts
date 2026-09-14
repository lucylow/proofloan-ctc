import { ReadabilityError } from "./errors";
import type { ReadabilityStatus } from "./types";

const transitions: Record<ReadabilityStatus, ReadabilityStatus[]> = {
  created: ["watching", "rejected", "failed"],
  watching: ["awaiting-attestation", "expired", "failed"],
  "awaiting-attestation": ["proof-building", "expired", "failed", "rejected"],
  "proof-building": ["proof-ready", "failed"],
  "proof-ready": ["submitted", "failed"],
  submitted: ["verified", "rejected", "failed"],
  verified: ["delivered", "failed"],
  delivered: [],
  rejected: [],
  expired: [],
  failed: ["watching", "proof-building", "submitted"],
};

export function canTransition(from: ReadabilityStatus, to: ReadabilityStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: ReadabilityStatus, to: ReadabilityStatus): void {
  if (!canTransition(from, to)) {
    throw new ReadabilityError("TRANSITION", `Invalid readability transition ${from} -> ${to}.`);
  }
}

export function allowedTransitions(): Record<ReadabilityStatus, ReadabilityStatus[]> {
  return Object.fromEntries(
    Object.entries(transitions).map(([from, to]) => [from, [...to]]),
  ) as Record<ReadabilityStatus, ReadabilityStatus[]>;
}
