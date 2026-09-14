import { sha256Hex } from "./hash";

export type ConsensusJournalEntry = {
  sequence: number;
  eventType: "observation" | "vote" | "certificate" | "fault" | "slash" | "reward";
  operatorId?: string;
  sourceChain?: string;
  sourceBlock?: number;
  digest: string;
  timestamp: string;
  previousDigest?: string;
};

export class ConsensusJournal {
  private readonly entries: ConsensusJournalEntry[] = [];

  append(entry: Omit<ConsensusJournalEntry, "sequence" | "timestamp" | "digest" | "previousDigest">): ConsensusJournalEntry {
    const sequence = this.entries.length + 1;
    const timestamp = new Date().toISOString();
    const previousDigest = this.entries.at(-1)?.digest;
    const digest = sha256Hex({ sequence, eventType: entry.eventType, operatorId: entry.operatorId, sourceChain: entry.sourceChain, sourceBlock: entry.sourceBlock, timestamp, previousDigest });
    const value = { ...entry, sequence, timestamp, digest, previousDigest };
    this.entries.push(value);
    if (this.entries.length > 50_000) this.entries.splice(0, this.entries.length - 50_000);
    return structuredClone(value);
  }

  verifyChain(): boolean {
    let previous: string | undefined;
    for (const entry of this.entries) {
      if (entry.previousDigest !== previous) return false;
      const expected = sha256Hex({ sequence: entry.sequence, eventType: entry.eventType, operatorId: entry.operatorId, sourceChain: entry.sourceChain, sourceBlock: entry.sourceBlock, timestamp: entry.timestamp, previousDigest: entry.previousDigest });
      if (expected !== entry.digest) return false;
      previous = entry.digest;
    }
    return true;
  }

  list(limit = 250): ConsensusJournalEntry[] { return this.entries.slice(-Math.max(1, limit)).map(v => structuredClone(v)); }
}
