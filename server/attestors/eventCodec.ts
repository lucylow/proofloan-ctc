import type { AttestorEventType } from "@shared/attestors";
import { sha256Hex } from "./hash";

export type EncodedAttestorEvent = { version: 1; type: AttestorEventType; payload: string; digest: string };
export function encodeEvent(type: AttestorEventType, payload: unknown): EncodedAttestorEvent { const serialized = JSON.stringify(payload); return { version: 1, type, payload: serialized, digest: sha256Hex({ version: 1, type, serialized }) }; }
export function decodeEvent(event: EncodedAttestorEvent): unknown { if (event.version !== 1) throw new Error("Unsupported event version."); if (event.digest !== sha256Hex({ version: event.version, type: event.type, serialized: event.payload })) throw new Error("Event digest mismatch."); return JSON.parse(event.payload); }
