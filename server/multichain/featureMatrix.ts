import {
  listChainCapabilities,
  type AttestcoinEnvironmentId,
  type ChainCapability,
} from "@shared/multichain";
import { getCachedAttestcoinEnvironment } from "./environment";

export type FeatureFlag =
  | "live-proof"
  | "preview-proof"
  | "source-rpc"
  | "health-probe"
  | "creditcoin-verify"
  | "free-read"
  | "paid-action"
  | "receipt-status"
  | "finality";

export type FeatureMatrixRow = ChainCapability & {
  features: Record<FeatureFlag, boolean>;
};

export function buildFeatureMatrix(
  environment?: AttestcoinEnvironmentId,
): FeatureMatrixRow[] {
  const resolved = environment ?? getCachedAttestcoinEnvironment().id;
  return listChainCapabilities(resolved).map(capability => ({
    ...capability,
    features: {
      "live-proof": capability.liveProof,
      "preview-proof": capability.preview,
      "source-rpc": true,
      "health-probe": true,
      "creditcoin-verify": capability.liveProof,
      "free-read": capability.freeCrossChainReads,
      "paid-action": capability.atcPaidActions,
      "receipt-status": capability.liveProof,
      "finality": capability.liveProof,
    },
  }));
}

export function featureEnabled(
  chainName: ChainCapability["name"],
  feature: FeatureFlag,
  environment?: AttestcoinEnvironmentId,
) {
  const row = buildFeatureMatrix(environment).find(item => item.name === chainName);
  return row?.features[feature] ?? false;
}

export function officialLiveProofChains(environment?: AttestcoinEnvironmentId) {
  return buildFeatureMatrix(environment)
    .filter(row => row.features["live-proof"])
    .map(row => row.name);
}
