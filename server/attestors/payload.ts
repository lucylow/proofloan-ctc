import { sha256Hex } from "./hash";
export function payloadHash(payloadHex: string): string { if (!/^0x[0-9a-fA-F]*$/.test(payloadHex)) throw new Error("Payload must be hex."); return sha256Hex({ payloadHex: payloadHex.toLowerCase() }); }
export function payloadBytes(payloadHex: string): number { return Math.floor(payloadHex.replace(/^0x/, "").length / 2); }
export function normalizePayload(payloadHex: string): string { const body = payloadHex.replace(/^0x/, ""); if (body.length % 2 !== 0) throw new Error("Payload hex must contain complete bytes."); return `0x${body.toLowerCase()}`; }
