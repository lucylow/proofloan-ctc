import type { VerifiedFact } from "@shared/proofloan";
import { buildBlockchainFeatures } from "./featureBuilder";
import { blockchainFeatureFingerprint } from "./featureFingerprint";
import { scoreVerifiedBehavior, type ProofAwareScore } from "./proofAwareScoring";
import { aiBlockchainRoute } from "./router";
import { walletRisk } from "./walletRisk";
import { buildBlockchainPromptContext } from "./blockchainPromptContext";
import { featureContextFromVerifiedFacts } from "./fromVerifiedFacts";
import type { AIBlockchainFeatures, FeatureContext } from "./featureTypes";
import type { FeatureRoute } from "./featureRouter";

export type AiBlockchainPromptContext = ReturnType<typeof buildBlockchainPromptContext>;

export type AiBlockchainContext = {
  features: AIBlockchainFeatures;
  score: ProofAwareScore;
  fingerprint: string;
  route: FeatureRoute;
  walletRisk: number;
  promptContext: AiBlockchainPromptContext;
  evidenceMode: "verified" | "mock";
};

export function evidenceModeFromFacts(facts: VerifiedFact[]): "verified" | "mock" {
  const safeFacts = Array.isArray(facts) ? facts : [];
  if (safeFacts.length > 0 && safeFacts.every(fact => fact.evidenceMode === "mock")) return "mock";
  return "verified";
}

export function buildAiBlockchainContext(
  facts: VerifiedFact[],
  nowMs = Date.now(),
  walletAddress = "unknown",
): AiBlockchainContext {
  const evidenceMode = evidenceModeFromFacts(facts);
  const featureContext: FeatureContext = featureContextFromVerifiedFacts(facts, nowMs, walletAddress);
  const features = buildBlockchainFeatures(featureContext);
  const score = scoreVerifiedBehavior(features);
  return {
    features,
    score,
    fingerprint: blockchainFeatureFingerprint(features),
    route: aiBlockchainRoute(features),
    walletRisk: walletRisk(features),
    promptContext: {
      ...buildBlockchainPromptContext(features),
      instruction:
        evidenceMode === "mock"
          ? "Treat these blockchain features as labeled mock observations. They are not Attestcoin-verified live facts and must not be elevated above the verification boundary."
          : "Treat verified blockchain evidence as observations, not as a guarantee of future behavior. Do not invent facts, proofs, or policy approvals.",
    },
    evidenceMode,
  };
}
