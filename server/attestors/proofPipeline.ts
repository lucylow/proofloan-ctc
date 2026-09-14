import type { AttestationCertificate, MerkleProofEnvelope, VerifiedCrossChainFact } from "@shared/attestors";
import { verifyReadProof } from "./readProof";

export type ProofPipelineStage = "candidate" | "matured" | "attested" | "proved" | "verified" | "rejected";
export type ProofPipelineState = { stage: ProofPipelineStage; certificate?: AttestationCertificate; fact?: VerifiedCrossChainFact; reason?: string; updatedAt: string };

export class ProofPipeline {
  private state: ProofPipelineState = { stage: "candidate", updatedAt: new Date().toISOString() };
  mature(): ProofPipelineState { this.state = { ...this.state, stage: "matured", updatedAt: new Date().toISOString() }; return { ...this.state }; }
  attest(certificate: AttestationCertificate): ProofPipelineState { if (this.state.stage !== "matured") throw new Error("Proof must mature before attestation."); this.state = { stage: "attested", certificate: structuredClone(certificate), updatedAt: new Date().toISOString() }; return { ...this.state }; }
  verify(envelope: MerkleProofEnvelope): ProofPipelineState { if (!this.state.certificate) throw new Error("Attestation certificate is required."); try { const fact = verifyReadProof(envelope, this.state.certificate); this.state = { stage: "verified", certificate: this.state.certificate, fact, updatedAt: new Date().toISOString() }; } catch (error) { this.state = { ...this.state, stage: "rejected", reason: error instanceof Error ? error.message : "proof rejected", updatedAt: new Date().toISOString() }; } return { ...this.state }; }
  get(): ProofPipelineState { return structuredClone(this.state); }
}
