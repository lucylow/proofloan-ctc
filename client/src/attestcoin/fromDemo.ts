import { isAttestcoinSourceChainName } from "@shared/multichain";
import type { AttestcoinEventType, AttestcoinFact, AttestcoinFreshness, AttestcoinSourceChain } from "@shared/attestcoin";
import type { DemoEvidence, EvidenceType } from "@/demo/types";

function asSourceChain(chain: string): AttestcoinSourceChain | null {
  return isAttestcoinSourceChainName(chain) ? chain : null;
}

function asEventType(type: EvidenceType): AttestcoinEventType {
  if (type === "REPAYMENT" || type === "COLLATERAL_DEPOSIT" || type === "LATE_PAYMENT") {
    return type;
  }
  if (type === "LIQUIDITY" || type === "BALANCE_HISTORY") {
    return "COLLATERAL_DEPOSIT";
  }
  return "REPAYMENT";
}

function asFreshness(freshness: DemoEvidence["freshness"]): AttestcoinFreshness {
  if (freshness === "Fresh" || freshness === "Aging" || freshness === "Stale") {
    return freshness;
  }
  return "Aging";
}

export function toAttestcoinFacts(evidence: DemoEvidence[]): AttestcoinFact[] {
  return evidence.flatMap(item => {
    const chain = asSourceChain(item.chain);
    if (!chain) return [];

    return [{
      id: item.id,
      applicationId: item.applicationId,
      chain,
      sourceBlock: item.blockNumber,
      txHash: item.sourceTransaction,
      eventType: asEventType(item.type),
      amount: item.amount != null ? String(item.amount) : "—",
      asset: item.currency ?? "USDC",
      verificationBlock: item.blockNumber + 12,
      verifiedAt: item.timestamp,
      observedAt: item.timestamp,
      freshness: asFreshness(item.freshness),
      proofRoot: `0xdemo_${item.id}`,
      verifier: item.verifier,
      sourceVerified: item.verified,
      decoderVersion: "demo-nav",
    }];
  });
}
