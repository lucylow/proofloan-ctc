import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import { buildFeatureVector } from "../underwriting";
import type { FeatureVectorAdapter } from "./adapters";

export class UnderwritingFeatureVectorAdapter implements FeatureVectorAdapter {
  fromFacts(facts: VerifiedFact[], nowMs?: number): FeatureVector {
    return buildFeatureVector(facts, nowMs);
  }
}

export const featureVectorAdapter = new UnderwritingFeatureVectorAdapter();
