import {
  feeSplitReconciles,
  isLocalAtcChain,
  normalizeAtcChain,
  parseAtomic,
  type AtcActionEnvelope,
  type AtcChainId,
  type AtcQuote,
} from "@shared/atc";
import { hashAtcIntegrity, hashAtcPayload } from "./pricing";
import { AtcError } from "./errors";

function parseChain(value: string, label: string): AtcChainId {
  try {
    return normalizeAtcChain(value);
  } catch (error) {
    throw new AtcError(
      "VALIDATION",
      error instanceof Error ? error.message : `${label} is not a supported ATC chain.`,
    );
  }
}

export function resolveActionChains(
  sourceChain: string,
  destinationChain: string,
  kind: "read" | "action",
): { sourceChain: AtcChainId; destinationChain: AtcChainId } {
  const source = parseChain(sourceChain, "Source chain");
  const destination = parseChain(destinationChain, "Destination chain");
  if (kind === "action" && source === destination) {
    throw new AtcError("VALIDATION", "Cross-chain ATC actions require distinct source and destination chains.");
  }
  if (kind === "action" && !isLocalAtcChain(source) && !isLocalAtcChain(destination)) {
    throw new AtcError(
      "VALIDATION",
      "Paid ATC actions must include Creditcoin as the local source or destination.",
    );
  }
  return { sourceChain: source, destinationChain: destination };
}

export function assertSenderShape(sender: string): void {
  if (sender.trim() !== sender || sender.length < 4) {
    throw new AtcError("VALIDATION", "ATC sender is malformed.");
  }
}

export function assertQuoteFresh(quote: AtcQuote, now = new Date()): void {
  const expiresAt = Date.parse(quote.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    throw new AtcError("VALIDATION", "ATC quote expiry is malformed.");
  }
  if (now.getTime() > expiresAt) {
    throw new AtcError("EXPIRED", "ATC quote has expired.");
  }
}

export function assertQuoteIntegrity(quote: AtcQuote): void {
  const expected = hashAtcIntegrity({
    quoteId: quote.quoteId,
    kind: quote.kind,
    environment: quote.environment,
    sourceChain: quote.sourceChain,
    destinationChain: quote.destinationChain,
    actionKind: quote.actionKind,
    payloadHash: quote.payloadHash,
    proofCount: quote.proofCount,
    priority: quote.priority,
    pricingVersion: quote.pricingVersion,
    fee: quote.fee,
    expiresAt: quote.expiresAt,
  });
  if (expected !== quote.integrityHash) {
    throw new AtcError("INTEGRITY", "ATC quote integrity hash does not match the quoted fields.");
  }
  if (
    quote.totalAtomic !== quote.fee.totalAtomic ||
    quote.operatorRewardAtomic !== quote.fee.operatorRewardAtomic ||
    quote.burnAtomic !== quote.fee.burnAtomic ||
    quote.treasuryAtomic !== quote.fee.treasuryAtomic
  ) {
    throw new AtcError("INTEGRITY", "ATC quote fee fields are inconsistent.");
  }
  if (!feeSplitReconciles(quote.fee)) {
    throw new AtcError("INTEGRITY", "ATC quote fee split does not reconcile.");
  }
}

export function assertPayloadIntegrity(payload: unknown, expectedHash: string): void {
  const actual = hashAtcPayload(payload);
  if (actual !== expectedHash) {
    throw new AtcError("INTEGRITY", "ATC payload hash does not match the quoted payload.");
  }
}

export function assertActionMatchesQuote(action: AtcActionEnvelope, quote: AtcQuote): void {
  if (action.quoteId !== quote.quoteId) {
    throw new AtcError("INTEGRITY", "ATC action is not bound to the supplied quote.");
  }
  if (action.environment !== quote.environment) {
    throw new AtcError("VALIDATION", "ATC action environment does not match the quote.");
  }
  if (action.destinationChain !== quote.destinationChain) {
    throw new AtcError("VALIDATION", "ATC action destination does not match the quoted destination.");
  }
  if (action.sourceChain !== quote.sourceChain) {
    throw new AtcError("VALIDATION", "ATC action source chain does not match the quoted source.");
  }
  if (action.actionKind !== quote.actionKind) {
    throw new AtcError("VALIDATION", "ATC action kind does not match the quote.");
  }
  if (action.payloadHash !== quote.payloadHash) {
    throw new AtcError("INTEGRITY", "ATC action payload hash does not match the quote.");
  }
  if (quote.kind === "read") {
    throw new AtcError("VALIDATION", "Read quotes cannot be settled as paid ATC actions.");
  }
  if (parseAtomic(quote.totalAtomic) <= 0n) {
    throw new AtcError("VALIDATION", "Paid ATC actions require a positive fee quote.");
  }
}

export function requestFingerprint(input: {
  environment: string;
  sender: string;
  sourceChain: string;
  destinationChain: string;
  actionKind: string;
  payloadHash: string;
  proofCount: number;
  priority: string;
}): string {
  return hashAtcIntegrity(input);
}
