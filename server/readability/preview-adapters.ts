import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import type { AttestationProvider } from "./types";
import type { AttestationSnapshot } from "./attestation";

export const PRODUCTION_READABILITY_BOUNDARIES = {
  eventScan: "server/readability/events.ts",
  eventPolicy: "server/readability/event-policy.ts",
  previewProofBuilder: "server/readability/proof-builder.ts DeterministicProofBuilder (educational keccak inclusion, not consensus)",
  liveProofBuilder: "server/multichain/proof.ts + @gluwa/usc-sdk ProofBuilder",
  liveBlockProver: `server/multichain/proof.ts PrecompileBlockProver ${BLOCK_PROVER_PRECOMPILE}`,
  previewBlockProver: "server/readability/asc.ts PreviewBlockProver (local USC-style keccak inclusion; not 0x0FD2 consensus)",
  previewMerkle: "server/readability/merkle hashLeaf(0x00) / hashInner(0x01)",
  receiptGuard: "server/multichain/receipt.ts assertSuccessfulReceipt / readability proof-validation",
  gasPlanner: "server/readability/gas (estimates and schedules; does not replace Block Prover verification)",
  durableWorker: "server/readability/offchain/ ProductionReadabilityWorker (orchestration, retries, catch-up)",
} as const;

export class PreviewAttestationProvider implements AttestationProvider {
  readonly kind = "preview" as const;

  async waitForAttestation(input: {
    chainKey: number;
    blockNumber: number;
    blockHash: string;
    timeoutMs: number;
  }): Promise<AttestationSnapshot> {
    const now = new Date();
    return {
      chainKey: input.chainKey,
      sourceBlock: input.blockNumber,
      sourceBlockHash: input.blockHash,
      attestedAt: now.toISOString(),
      validUntil: new Date(now.getTime() + Math.max(input.timeoutMs, 60_000)).toISOString(),
    };
  }
}
