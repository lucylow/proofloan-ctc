import type { MockDataset } from "../types";
import { selectPrimaryApplication } from "../selectors";

export function offerPresentation(dataset: MockDataset) {
  const application = selectPrimaryApplication(dataset);
  const offer = application ? dataset.offers.find(item => item.applicationId === application.id) : undefined;
  return {
    offerId: offer?.id ?? null,
    status: offer?.status ?? "Unavailable",
    amount: offer?.amount ?? 0,
    apr: offer?.apr ?? 0,
    presentationOnly: true as const,
  };
}
