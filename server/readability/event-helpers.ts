import { createHash } from "node:crypto";
import type { SourceEvent } from "@shared/readability";

export function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function normalizeText(value: unknown, max = 256): string {
  const text = String(value ?? "").trim();
  return text.length > max ? text.slice(0, max) : text;
}

export function isHex(value: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

export function stableRecord(event: SourceEvent): Record<string, unknown> {
  return {
    chainId: event.chainId,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash.toLowerCase(),
    transactionIndex: event.transactionIndex,
    logIndex: event.logIndex,
    contractAddress: event.contractAddress.toLowerCase(),
    eventName: event.eventName,
  };
}

export function fingerprintEvent(event: SourceEvent): string {
  return digest(stableRecord(event));
}

export function eventLabel(event: SourceEvent): string {
  return `${event.chainId}:${event.eventName}:${event.blockNumber}:${event.logIndex}`;
}

export function clampConfirmations(value: number, max = 100_000_000): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.floor(value)));
}

export function isFresh(observedAt: string, ttlMs: number, now = Date.now()): boolean {
  const timestamp = Date.parse(observedAt);
  return Number.isFinite(timestamp) && timestamp + ttlMs >= now;
}

export function buildAuditRecord(event: SourceEvent, outcome: string): Record<string, unknown> {
  return {
    event: eventLabel(event),
    fingerprint: fingerprintEvent(event),
    outcome: normalizeText(outcome, 128),
    timestamp: new Date().toISOString(),
  };
}

export function compareEventOrder(a: SourceEvent, b: SourceEvent): number {
  if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
  if (a.transactionIndex !== b.transactionIndex) return a.transactionIndex - b.transactionIndex;
  return a.logIndex - b.logIndex;
}

export function summarizeEvent(event: SourceEvent): string {
  return JSON.stringify({
    id: eventLabel(event),
    fingerprint: fingerprintEvent(event),
    confirmations: clampConfirmations(event.confirmations),
    fresh: isFresh(event.observedAt, 5 * 60 * 1000),
  });
}
