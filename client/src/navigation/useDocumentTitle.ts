import { useEffect } from "react";
import { useLocation } from "wouter";

import { APPLICATION_DETAIL_SECTIONS, parseWorkspacePath } from "./config";

export function useDocumentTitle() {
  const [location] = useLocation();

  useEffect(() => {
    const parsed = parseWorkspacePath(location);

    if (parsed.kind === "application") {
      const section = APPLICATION_DETAIL_SECTIONS.find(
        item => item.id === parsed.section,
      );

      document.title =
        parsed.section === "overview"
          ? `${parsed.applicationId} · ProofLoan`
          : `${section?.label ?? "Details"} · ${parsed.applicationId} · ProofLoan`;
      return;
    }

    if (!parsed.item) {
      document.title = "ProofLoan";
      return;
    }

    document.title = `${parsed.item.label} · ProofLoan`;
  }, [location]);
}
