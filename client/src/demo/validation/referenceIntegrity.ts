import type { DemoDataSet } from "../types";

export type DemoIntegrityIssue = {
  code: string;
  message: string;
  severity: "warning" | "error";
};

export function inspectDemoReferences(data: DemoDataSet): DemoIntegrityIssue[] {
  const issues: DemoIntegrityIssue[] = [];
  const applicationIds = new Set(data.applications.map(item => item.id));

  for (const evidence of data.evidence) {
    if (!applicationIds.has(evidence.applicationId)) {
      issues.push({
        code: "ORPHAN_EVIDENCE",
        message: `Evidence ${evidence.id} points to missing application ${evidence.applicationId}`,
        severity: "warning",
      });
    }
  }

  for (const decision of data.decisions) {
    if (!applicationIds.has(decision.applicationId)) {
      issues.push({
        code: "ORPHAN_DECISION",
        message: `Decision ${decision.id} points to missing application ${decision.applicationId}`,
        severity: "warning",
      });
    }
  }

  for (const offer of data.offers) {
    if (!applicationIds.has(offer.applicationId)) {
      issues.push({
        code: "ORPHAN_OFFER",
        message: `Offer ${offer.id} points to missing application ${offer.applicationId}`,
        severity: "warning",
      });
    }
  }

  return issues;
}
