import type { MockApplication, MockProofRequest, MockTimelineEvent, MockVerifiedFact } from "../types";

export function createMockTimelines(
  applications: MockApplication[],
  facts: MockVerifiedFact[],
  proofs: MockProofRequest[],
): MockTimelineEvent[] {
  return applications.flatMap(application => {
    const relatedProofs = proofs.filter(proof => proof.applicationId === application.id);
    const relatedFacts = facts.filter(fact => fact.applicationId === application.id);
    return [
      {
        id: `tl_${application.id}_intake`,
        applicationId: application.id,
        category: "wallet" as const,
        title: "Application intake",
        description: "Borrower identity captured for presentation only.",
        timestamp: application.createdAt,
        severity: "info" as const,
      },
      ...relatedProofs.slice(0, 2).map(proof => ({
        id: `tl_${proof.id}`,
        applicationId: application.id,
        category: "evidence" as const,
        title: `Attestcoin proof ${proof.status}`,
        description: proof.warnings[0] ?? "Proof request processed by the presentation adapter.",
        timestamp: proof.requestedAt,
        severity: (proof.status === "rejected" ? "error" : proof.status === "delayed" ? "warning" : "success") as MockTimelineEvent["severity"],
      })),
      ...relatedFacts.slice(0, 1).map(fact => ({
        id: `tl_${fact.id}`,
        applicationId: application.id,
        category: "underwriting" as const,
        title: fact.sourceVerified ? "Verified fact admitted" : "Preview fact labeled",
        description: `${fact.eventType} on ${fact.chainName}.`,
        timestamp: fact.verifiedAt,
        severity: (fact.sourceVerified ? "success" : "warning") as MockTimelineEvent["severity"],
      })),
    ];
  });
}
