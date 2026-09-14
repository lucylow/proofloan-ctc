import type { AttestcoinFact, AttestcoinProofBundle, AttestcoinSourceChain } from "@shared/attestcoin";
import { hashValue } from "../underwriting";
import { previewAttestcoinFacts } from "./compat";
import { resolveSourceChain } from "../multichain/registry";
import { attestorService } from "../attestors";
import { currentAttestorEnvironment } from "../attestors/operational";

export function buildPreviewBundle(
  walletAddress: string,
  sourceChain: AttestcoinSourceChain,
  requestId = `preview_${Date.now().toString(36)}`,
): AttestcoinProofBundle {
  const resolved = resolveSourceChain(sourceChain);

  const facts: AttestcoinFact[] = previewAttestcoinFacts(
    walletAddress,
    sourceChain,
  ).map(fact => ({
    id: fact.id,
    applicationId: fact.id,
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
    verifier: "Attestcoin preview adapter",
    sourceVerified: false,
    decoderVersion: "preview-v1",
  }));

  const sourceBlock = Math.max(
    ...facts.map(fact => fact.sourceBlock),
  );

  const verificationBlock = Math.max(
    ...facts.map(fact => fact.verificationBlock),
  );

  const warnings = [
    "Preview mode is presentation-safe and does not assert live cross-chain verification.",
  ];

  if (resolved.experimental) {
    warnings.push(
      `${sourceChain} is experimental: it is not listed with an official Attestcoin chainkey, so live proofs are rejected.`,
    );
  }

  return {
    receipt: {
      requestId,
      mode: "preview",
      stage: "complete",
      chainKey: resolved.chainKey ?? 0,
      sourceChain,
      sourceBlock,
      verificationBlock,
      txHash: facts[0]?.txHash ?? `0xpreview_${hashValue(walletAddress)}`,
      proofRoot: `0xpreview_${hashValue({ walletAddress, sourceChain })}`,
      verified: false,
      verificationStatus: "preview",
      merkleProofPresent: false,
      continuityProofPresent: false,
      environment: resolved.environment,
      latencyMs: 30,
      cached: false,
      retries: 0,
      warnings,
    },
    facts,
    attestorNetwork: attestorService.snapshot(currentAttestorEnvironment(resolved.environment)),
  };
}
