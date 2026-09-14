import type { AttestorObservation } from "@shared/attestors";

export interface AttestorObservationProvider { observe(sourceChain: string, sourceBlock: number): Promise<AttestorObservation>; heartbeat(): Promise<{ available: boolean; latencyMs: number }>; }

export class RpcObservationProvider implements AttestorObservationProvider {
  constructor(private readonly operatorId: string, private readonly fetchBlock: (sourceChain: string, sourceBlock: number) => Promise<{ blockHash: string; previousBlockHash: string }>) {}
  async observe(sourceChain: string, sourceBlock: number): Promise<AttestorObservation> { const block = await this.fetchBlock(sourceChain, sourceBlock); const now = new Date(); return { observationId: `obs_${this.operatorId}_${sourceChain}_${sourceBlock}`, operatorId: this.operatorId, sourceChain, sourceBlock, blockHash: block.blockHash, previousBlockHash: block.previousBlockHash, observedAt: now.toISOString(), maturityAt: now.toISOString(), finalized: true }; }
  async heartbeat() { const started = Date.now(); try { await Promise.resolve(); return { available: true, latencyMs: Date.now() - started }; } catch { return { available: false, latencyMs: Date.now() - started }; } }
}
