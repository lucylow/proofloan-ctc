import {
  FOCUSED_SOURCE_EVENTS,
  GENERIC_SOURCE_EVENTS,
  REQUIRED_SOURCE_EVENT_FIELDS,
  type ReadabilityQuery,
  type SourceEvent,
} from "@shared/readability";
import { ReadabilityError } from "./errors";

const GENERIC = new Set<string>(GENERIC_SOURCE_EVENTS);
const FOCUSED = new Set<string>(FOCUSED_SOURCE_EVENTS);
const EVENT_NAME_PATTERN = /^[A-Z][A-Za-z0-9]+$/;

export function isGenericSourceEvent(eventName: string): boolean {
  return GENERIC.has(eventName);
}

export function isFocusedSourceEvent(eventName: string): boolean {
  return FOCUSED.has(eventName);
}

export function assertExplicitEventName(eventName: string): void {
  if (isGenericSourceEvent(eventName)) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      `Generic source event "${eventName}" cannot trigger readability. Emit a focused ProofLoan/Attestcoin event that already includes the destination-chain data instead of watching ERC-20/721 Transfer.`,
    );
  }
  if (!EVENT_NAME_PATTERN.test(eventName)) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      `Event name "${eventName}" must be an explicit PascalCase identifier.`,
    );
  }
}

export function missingRequiredFields(event: SourceEvent): string[] {
  return REQUIRED_SOURCE_EVENT_FIELDS.filter(field => {
    const value = event[field];
    if (typeof value === "string") return value.trim().length === 0;
    return value === undefined || value === null;
  });
}

export function assertEventPolicy(event: SourceEvent, query?: ReadabilityQuery): void {
  assertExplicitEventName(event.eventName);
  const missing = missingRequiredFields(event);
  if (missing.length > 0) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      `Source event is missing required cross-chain fields: ${missing.join(", ")}.`,
    );
  }
  if (query && event.eventName !== query.eventName) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      `Source event ${event.eventName} does not match query event ${query.eventName}.`,
    );
  }
  if (query && event.contractAddress.toLowerCase() !== query.sourceContract.toLowerCase()) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      "Source event contract does not match the focused source contract in the query.",
    );
  }
  if (query?.transactionHash && event.transactionHash.toLowerCase() !== query.transactionHash.toLowerCase()) {
    throw new ReadabilityError(
      "EVENT_POLICY",
      "Source event transaction hash does not match the readability query.",
    );
  }
}

export function eventPolicySnapshot() {
  return {
    forbidden: [...GENERIC_SOURCE_EVENTS],
    focused: [...FOCUSED_SOURCE_EVENTS],
    requiredFields: [...REQUIRED_SOURCE_EVENT_FIELDS],
    rule: "Watch a focused source contract and an unambiguous event. Do not trigger readability from generic Transfer logs. Include destination-chain identifiers in the emitted event.",
  };
}
