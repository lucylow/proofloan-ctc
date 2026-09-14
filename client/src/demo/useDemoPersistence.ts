import { useEffect } from "react";

import type { DemoScenario } from "./types";

const KEY =
  "proofloan.demo.presentation";

export function useDemoPersistence(
  scenario: DemoScenario,
) {
  useEffect(() => {
    try {
      sessionStorage.setItem(
        KEY,
        scenario,
      );
    } catch {
      // Ignore browser storage limitations.
    }
  }, [scenario]);

  return null;
}
