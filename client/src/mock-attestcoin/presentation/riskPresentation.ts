import type { MockDataset } from "../types";
import { selectPrimaryApplication, selectDecisionForApplication } from "../selectors";

export function riskPresentation(dataset: MockDataset) {
  const application = selectPrimaryApplication(dataset);
  const decision = application ? selectDecisionForApplication(dataset, application.id) : undefined;
  const guard = application ? dataset.riskGuards.find(item => item.applicationId === application.id) : undefined;
  return {
    applicationId: application?.id ?? null,
    riskTier: decision?.riskTier ?? application?.riskTier ?? "E",
    pd30: decision?.pd30 ?? 0,
    pd90: decision?.pd90 ?? 0,
    guardStatus: guard?.status ?? "Blocked",
    rejectionReason: guard?.rejectionReason,
  };
}
