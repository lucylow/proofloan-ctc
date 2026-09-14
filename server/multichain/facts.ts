import type { AttestcoinFact, AttestcoinSourceChain, CanonicalAttestcoinProofRecord } from "@shared/attestcoin";
import type { VerifiedFact } from "@shared/proofloan";
import {
  getExplorerTxUrl,
  getSourceChainRecord,
  type AttestcoinEnvironmentId,
  type AttestcoinSourceChainName,
} from "@shared/multichain";
import { hashValue } from "../underwriting";
import { proofFingerprint } from "../attestcoin/fingerprint";
import { previewTemplateFor } from "./sourceAdapters";
import { getCachedAttestcoinEnvironment } from "./environment";

export type NormalizedEvidence = {
  facts: AttestcoinFact[];
  evidenceRoot: string;
  freshnessScore: number;
  chains: AttestcoinSourceChainName[];
  environment: AttestcoinEnvironmentId;
  digest: string;
};

export function normalizeVerifiedFact(
  input: VerifiedFact,
  extras: Partial<AttestcoinFact> = {},
): AttestcoinFact {
  return {
    id: input.id,
    chain: input.chain,
    sourceBlock: input.sourceBlock,
    txHash: input.txHash,
    eventType: input.eventType,
    amount: input.amount,
    asset: input.asset,
    verificationBlock: input.verificationBlock,
    verifiedAt: input.verifiedAt,
    observedAt: input.observedAt,
    freshness: input.freshness,
    proofRoot: input.proofRoot,
    verifier: extras.verifier ?? input.proofWorker,
    sourceVerified: extras.sourceVerified ?? true,
    decoderVersion: extras.decoderVersion,
    proofHash: extras.proofHash,
    applicationId: extras.applicationId ?? input.id,
    txIndex: extras.txIndex ?? input.txIndex,
    chainKey: extras.chainKey ?? input.chainKey,
    merkleProofHash: extras.merkleProofHash ?? input.merkleProofHash,
    continuityProofHash: extras.continuityProofHash ?? input.continuityProofHash,
    verificationStatus: extras.verificationStatus ?? input.verificationStatus,
    receiptStatus: extras.receiptStatus ?? input.receiptStatus,
    environment: extras.environment ?? input.environment,
    confirmations: extras.confirmations ?? input.confirmations,
    requestHash: extras.requestHash ?? input.requestHash,
  };
}

export function computeCrossChainDigest(facts: AttestcoinFact[]) {
  const ordered = [...facts]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(fact => ({
      chain: fact.chain,
      chainId: getSourceChainRecord(fact.chain).id,
      txHash: fact.txHash,
      sourceBlock: fact.sourceBlock,
      verificationBlock: fact.verificationBlock,
      proofRoot: fact.proofRoot,
      eventType: fact.eventType,
    }));

  return `0x${hashValue({
    protocol: "Attestcoin Protocol",
    namespace: "proofloan:multichain:digest",
    facts: ordered,
  })}`;
}

export function computeEvidenceRoot(facts: AttestcoinFact[]) {
  const ordered = [...facts]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(fact => ({
      id: fact.id,
      txHash: fact.txHash,
      sourceBlock: fact.sourceBlock,
      verificationBlock: fact.verificationBlock,
      proofRoot: fact.proofRoot,
      eventType: fact.eventType,
      amount: fact.amount,
      asset: fact.asset,
      chain: fact.chain,
    }));

  return `0x${hashValue({
    protocol: "Attestcoin Protocol",
    facts: ordered,
  })}`;
}

export function freshnessScore(facts: AttestcoinFact[]) {
  if (facts.length === 0) return 0;
  const score = facts.reduce((total, fact) => {
    if (fact.freshness === "Fresh") return total + 1;
    if (fact.freshness === "Aging") return total + 0.55;
    return total + 0.1;
  }, 0);
  return Math.round((score / facts.length) * 100);
}

export function normalizeEvidence(facts: AttestcoinFact[]): NormalizedEvidence {
  const environment = getCachedAttestcoinEnvironment().id;
  return {
    facts,
    evidenceRoot: computeEvidenceRoot(facts),
    freshnessScore: freshnessScore(facts),
    chains: Array.from(new Set(facts.map(fact => fact.chain))),
    environment,
    digest: computeCrossChainDigest(facts),
  };
}

export function factFromVerifiedProof(input: {
  sourceChain: AttestcoinSourceChain;
  txHash: string;
  sourceBlock: number;
  verificationBlock: number;
  proofRoot: string;
  chainKey: number;
  txIndex?: number;
  merkleProofHash?: string;
  continuityProofHash?: string;
  receiptStatus?: AttestcoinFact["receiptStatus"];
  environment?: string;
  confirmations?: number;
  requestHash?: string;
  verificationStatus?: AttestcoinFact["verificationStatus"];
}): AttestcoinFact {
  const now = new Date().toISOString();
  return {
    id: `vf_${proofFingerprint({
      chainKey: input.chainKey,
      sourceBlock: input.sourceBlock,
      txHash: input.txHash,
      proofRoot: input.proofRoot,
    })}`,
    chain: input.sourceChain,
    sourceBlock: input.sourceBlock,
    txHash: input.txHash,
    txIndex: input.txIndex,
    eventType: "REPAYMENT",
    amount: "verified source transaction",
    asset: "SOURCE_TX",
    verificationBlock: input.verificationBlock,
    verifiedAt: now,
    observedAt: now,
    freshness: "Fresh",
    proofRoot: input.proofRoot,
    verifier: "Attestcoin proof worker",
    sourceVerified: true,
    decoderVersion: "attestcoin-v2",
    chainKey: input.chainKey,
    merkleProofHash: input.merkleProofHash,
    continuityProofHash: input.continuityProofHash,
    verificationStatus: input.verificationStatus ?? "verified",
    receiptStatus: input.receiptStatus,
    environment: input.environment,
    confirmations: input.confirmations,
    requestHash: input.requestHash,
  };
}

export function factFromCanonicalProof(
  record: CanonicalAttestcoinProofRecord,
): AttestcoinFact {
  return factFromVerifiedProof({
    sourceChain: record.sourceChain,
    txHash: record.txHash,
    sourceBlock: record.sourceBlock,
    verificationBlock: record.verificationBlock,
    proofRoot: record.proofRoot,
    chainKey: record.chainKey,
    txIndex: record.txIndex,
    merkleProofHash: record.merkleProofHash,
    continuityProofHash: record.continuityProofHash,
    receiptStatus: record.receiptStatus,
    environment: record.environment,
    confirmations: record.confirmations,
    requestHash: record.requestHash,
    verificationStatus: record.verificationStatus,
  });
}

export function toVerifiedFact(fact: AttestcoinFact): VerifiedFact {
  return {
    id: fact.id,
    chain: fact.chain,
    sourceBlock: fact.sourceBlock,
    txHash: fact.txHash,
    eventType: fact.eventType,
    amount: fact.amount,
    asset: fact.asset,
    verificationBlock: fact.verificationBlock,
    verifiedAt: fact.verifiedAt,
    observedAt: fact.observedAt,
    freshness: fact.freshness,
    proofRoot: fact.proofRoot,
    proofWorker: "Attestcoin proof worker",
    chainKey: fact.chainKey,
    txIndex: fact.txIndex,
    merkleProofHash: fact.merkleProofHash,
    continuityProofHash: fact.continuityProofHash,
    verificationStatus: fact.verificationStatus,
    receiptStatus: fact.receiptStatus,
    environment: fact.environment,
    confirmations: fact.confirmations,
    requestHash: fact.requestHash,
  };
}

export function previewFactsFor(
  walletAddress: string,
  sourceChain: AttestcoinSourceChainName,
): VerifiedFact[] {
  const template = previewTemplateFor(sourceChain);
  const root = `0xpreview_${hashValue({
    walletAddress,
    sourceChain,
    protocol: "Attestcoin Protocol",
  })}`;
  const now = new Date().toISOString();
  return [
    {
      id: `vf_${hashValue({ root, n: 1 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock,
      txHash: `${template.txPrefix}a91f...c42e`,
      eventType: "REPAYMENT",
      amount: "1,250 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      freshness: "Fresh",
      proofRoot: `${root}_a`,
      proofWorker: "Attestcoin proof worker",
    },
    {
      id: `vf_${hashValue({ root, n: 2 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 317_663,
      txHash: `${template.txPrefix}4b07...8aa1`,
      eventType: "COLLATERAL_DEPOSIT",
      amount: "2,800 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 5,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      freshness: "Fresh",
      proofRoot: `${root}_b`,
      proofWorker: "Attestcoin proof worker",
    },
    {
      id: `vf_${hashValue({ root, n: 3 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 423_742,
      txHash: `${template.txPrefix}11f8...d912`,
      eventType: "REPAYMENT",
      amount: "850 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 9,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
      freshness: "Aging",
      proofRoot: `${root}_c`,
      proofWorker: "Attestcoin proof worker",
    },
  ];
}

export function explorerUrlForFact(fact: Pick<AttestcoinFact, "chain" | "txHash">) {
  return getExplorerTxUrl(fact.chain, fact.txHash);
}

export class RegistryVerifiedFactAdapter {
  fromProof(record: CanonicalAttestcoinProofRecord, extras: Partial<AttestcoinFact> = {}) {
    return { ...factFromCanonicalProof(record), ...extras };
  }

  toVerifiedFact(fact: AttestcoinFact): VerifiedFact {
    return toVerifiedFact(fact);
  }
}

export const verifiedFactAdapter = new RegistryVerifiedFactAdapter();
