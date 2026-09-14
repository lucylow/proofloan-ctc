import type { AttestationCertificate } from "@shared/attestors";

export type ChainCheckpoint = {
  sourceChain: string;
  block: number;
  blockHash: string;
  attestationDigest: string;
  certificateId: string;
  committedAt: string;
};

export class CheckpointBook {
  private readonly latestByChain = new Map<string, ChainCheckpoint>();

  commit(certificate: AttestationCertificate): ChainCheckpoint {
    const current = this.latestByChain.get(certificate.sourceChain);
    if (current && certificate.sourceBlock < current.block) throw new Error("Cannot commit an older Attestor checkpoint.");
    const checkpoint: ChainCheckpoint = {
      sourceChain: certificate.sourceChain,
      block: certificate.sourceBlock,
      blockHash: certificate.blockHash,
      attestationDigest: certificate.digest,
      certificateId: certificate.certificateId,
      committedAt: new Date().toISOString(),
    };
    this.latestByChain.set(certificate.sourceChain, checkpoint);
    return { ...checkpoint };
  }

  get(chain: string): ChainCheckpoint | undefined { const value = this.latestByChain.get(chain); return value ? { ...value } : undefined; }
  snapshot(): Record<string, number> { return Object.fromEntries([...this.latestByChain.entries()].map(([chain, checkpoint]) => [chain, checkpoint.block])); }
}
