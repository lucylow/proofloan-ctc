import { useMemo } from "react";

import { useDemo } from "./DemoProvider";

export function useDemoSearch(
  query: string,
) {
  const { data } = useDemo();

  return useMemo(() => {
    const normalized =
      query.toLowerCase().trim();

    if (!normalized) {
      return {
        applications:
          data.applications.slice(0, 5),
        evidence:
          data.evidence.slice(0, 5),
        offers:
          data.offers.slice(0, 5),
      };
    }

    return {
      applications:
        data.applications.filter(
          application =>
            [
              application.id,
              application.state,
              application.borrowerLabel,
              application.riskTier,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalized),
        ),

      evidence:
        data.evidence.filter(
          evidence =>
            [
              evidence.id,
              evidence.type,
              evidence.chain,
              evidence.applicationId,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalized),
        ),

      offers:
        data.offers.filter(
          offer =>
            [
              offer.id,
              offer.pool,
              offer.applicationId,
              offer.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalized),
        ),
    };
  }, [data, query]);
}
