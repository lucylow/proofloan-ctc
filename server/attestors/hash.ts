import { createHash } from "node:crypto";

export function sha256Hex(value: unknown): string {
  const json = canonicalJson(value);
  return `0x${createHash("sha256").update(json).digest("hex")}`;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  return Object.keys(record).sort().reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = sortValue(record[key]);
    return acc;
  }, {});
}

export function digestAttestationInput(input: {
  environment: string;
  sourceChain: string;
  sourceBlock: number;
  blockHash: string;
  previousCheckpointHash?: string;
}): string {
  return sha256Hex(input);
}

export function digestMessageInput(input: {
  messageId: string;
  originChain: string;
  destinationChain: string;
  emitter: string;
  payloadHex: string;
  nonce: string;
}): string {
  return sha256Hex(input);
}
