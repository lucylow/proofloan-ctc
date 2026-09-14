import type {
  AtcActionReceipt,
  AtcFreeReadQuoteInput,
  AtcPrepareActionInput,
  AtcPreparedAction,
  AtcQuote,
  AtcSettleActionInput,
} from "@shared/atc";
import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import type {
  AttestcoinFact,
  CanonicalAttestcoinProofRecord,
} from "@shared/attestcoin";
import type { AttestcoinSourceChainName } from "@shared/multichain";
import type { SourceObservation } from "./finality";
import type { ResolvedSourceChain } from "./registry";

export const PRODUCTION_ADAPTER_BOUNDARIES = {
  sourceObservation: "server/multichain/sourceAdapters.ts",
  proofGeneration: "server/multichain/proof.ts",
  proofVerification: "server/multichain/proof.ts + Block Prover Precompile 0x0FD2",
  receiptValidation: "server/multichain/receipt.ts",
  factNormalization: "server/multichain/facts.ts",
  featureVector: "server/multichain/features.ts wrapping server/underwriting.ts",
  creditcoinExecution: "server/multichain/execution.ts",
  atcPayment: "server/atc/payment.ts ExternalProtocolAtcPaymentAdapter",
  atcProtocol: "server/atc/protocol.ts ExternalAtcProtocolAdapter",
  readabilityPreview: "server/readability preview adapters (educational)",
  readabilityLive: "server/readability/adapters.ts + server/multichain/proof.ts",
} as const;

export interface SourceObservationAdapter {
  readonly chain: AttestcoinSourceChainName;
  readonly resolved: ResolvedSourceChain;
  observe(txHash: string): Promise<SourceObservation>;
  getBlockNumber(): Promise<number>;
}

export interface AttestcoinProofAdapter {
  generateAndVerify(input: {
    txHash: string;
    sourceChain: AttestcoinSourceChainName;
    requestId?: string;
    idempotencyKey?: string;
    deadlineMs?: number;
  }): Promise<CanonicalAttestcoinProofRecord>;
}

export interface VerifiedFactAdapter {
  fromProof(
    record: CanonicalAttestcoinProofRecord,
    extras?: Partial<AttestcoinFact>,
  ): AttestcoinFact;
  toVerifiedFact(fact: AttestcoinFact): VerifiedFact;
}

export interface FeatureVectorAdapter {
  fromFacts(facts: VerifiedFact[], nowMs?: number): FeatureVector;
}

export interface CreditcoinExecutionAdapter {
  quoteFreeRead(input: AtcFreeReadQuoteInput): AtcQuote;
  preparePaidAction(input: AtcPrepareActionInput): Promise<AtcPreparedAction>;
  settlePaidAction(input: AtcSettleActionInput): Promise<AtcActionReceipt>;
}
