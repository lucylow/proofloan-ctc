import { createHash } from "node:crypto";

export function sha256Hex(value: unknown): string {
  try {
    return "0x" + createHash("sha256").update(stableStringify(value)).digest("hex");
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown hash failure";
    throw new Error(`unable to hash governance payload: ${detail}`);
  }
}

export function stableStringify(value: unknown): string {
  if (typeof value === "bigint") return JSON.stringify(value.toString());
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(k => JSON.stringify(k)+":"+stableStringify(record[k])).join(",")}}`;
}

export function proposalHash(proposal: { id: string; actions: unknown[]; snapshotBlock: number }): string {
  return sha256Hex({ id: proposal.id, actions: proposal.actions, snapshotBlock: proposal.snapshotBlock });
}
