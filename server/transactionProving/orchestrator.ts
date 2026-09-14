import { buildEnvelope } from "./builder";
import { classifyProofRisk } from "./risk";
import { TransactionProvingError } from "./errors";
import type { TransactionProverProvider } from "./provider";
import type { ProofEnvelope, ProvingRequest } from "./types";

export class TransactionProvingOrchestrator {
  constructor(private readonly provider: TransactionProverProvider) {}

  async build(request: ProvingRequest): Promise<ProofEnvelope> {
    const tx = await this.provider.getTransaction(request.target);
    const merkle = await this.provider.getMerkleProof(request.target);
    const continuity = await this.provider.getContinuityProof(request.target.chainKey, tx.blockNumber);
    const attestationBlock = await this.provider.getAttestationBlock(request.target.chainKey, tx.blockNumber);
    const envelope = buildEnvelope({
      requestId: request.requestId,
      target: request.target,
      transaction: tx,
      merkleProof: merkle,
      continuityProof: continuity,
      generatedAt: Date.now(),
      attestationBlock,
      proofBuilderVersion: "adapter",
    });
    const decision = classifyProofRisk(envelope);
    if (!decision.allowed) {
      throw new TransactionProvingError("PROOF", decision.reasonCodes.join(","));
    }
    return envelope;
  }
}
