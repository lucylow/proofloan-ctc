import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import type { ProofBundle, ReadabilityQuery, SourceEvent } from "@shared/readability";
import type { AscExecutor, BlockProver } from "./types";
import { assertSuccessfulReceipt, bindProofToEvent, proofDigest } from "./proof-validation";
import { ReadabilityError } from "./errors";
import { assessPreviewMerkleInclusion } from "./merkle/verify";

export { BLOCK_PROVER_PRECOMPILE };

export class PreviewBlockProver implements BlockProver {
  readonly kind = "preview" as const;
  readonly address = BLOCK_PROVER_PRECOMPILE;

  async verify(bundle: ProofBundle): Promise<boolean> {
    if (
      bundle.adapter !== "preview" ||
      !bundle.encodedTransaction ||
      !bundle.merkleRoot ||
      !bundle.continuityProofPresent ||
      (bundle.continuityRoots?.length ?? 0) === 0
    ) {
      return false;
    }
    return assessPreviewMerkleInclusion(bundle).valid;
  }
}

export class ReadabilityExecutor implements AscExecutor {
  constructor(private readonly prover: BlockProver) {}

  async submit(
    query: ReadabilityQuery,
    event: SourceEvent,
    bundle: ProofBundle,
  ): Promise<{ transactionHash: string; receiptStatus: 1 }> {
    bindProofToEvent(bundle, event);
    const verified = await this.prover.verify(bundle);
    if (!verified) {
      throw new ReadabilityError("PROOF", "Block Prover rejected the readability proof.");
    }
    if (event.confirmations < query.minConfirmations) {
      throw new ReadabilityError("FINALITY", "Source event is not final enough for ASC consumption.", true);
    }
    assertSuccessfulReceipt(bundle.receiptStatus ?? 0);
    return {
      transactionHash: `0xproofloan_${proofDigest(bundle).slice(0, 56)}`,
      receiptStatus: 1,
    };
  }
}
