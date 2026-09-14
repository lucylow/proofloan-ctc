import { MOCK_MODEL_VERSION } from "../constants";
import type { MockApplication, MockDecision, MockEvidenceSnapshot, MockFeatureVector } from "../types";
import { fingerprint } from "../utils";

export function createMockDecisions(
  applications: MockApplication[],
  features: MockFeatureVector[],
  snapshots: MockEvidenceSnapshot[],
): MockDecision[] {
  return applications.map(application => {
    const feature = features.find(item => item.applicationId === application.id);
    const snapshot = snapshots.find(item => item.applicationId === application.id);
    const late = feature?.latePayments ?? 0;
    const pd30 = late > 0 ? 18 + late * 6 : 4.2;
    const pd90 = pd30 + 3.5;
    const reasons = [
      ...(late === 0 && (feature?.repaymentCount ?? 0) >= 3 ? ["STRONG_REPAYMENT_HISTORY"] : []),
      ...(late > 0 ? ["RECENT_LATE_PAYMENT"] : []),
      ...((feature?.leverageRatio ?? 0) > 0.45 ? ["HIGH_LEVERAGE"] : []),
      ...((feature?.evidenceCount ?? 0) < 3 ? ["SPARSE_EVIDENCE"] : []),
    ];

    return {
      id: `dec_${application.id}`,
      applicationId: application.id,
      pd30,
      pd90,
      confidence: application.confidence,
      riskTier: application.riskTier,
      reasonCodes: reasons.length > 0 ? reasons : ["STRONG_REPAYMENT_HISTORY"],
      evidenceRoot: snapshot?.evidenceRoot ?? fingerprint(application.id),
      decisionHash: fingerprint({ application: application.id, model: MOCK_MODEL_VERSION, pd30 }),
      generatedAt: application.updatedAt,
    };
  });
}
