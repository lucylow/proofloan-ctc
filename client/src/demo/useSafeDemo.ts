import { useMemo } from "react";
import type { DemoScenario } from "./types";
import { createValidatedDemoData } from "./validation/demoRecovery";

export function useSafeDemo(scenario: DemoScenario) {
  return useMemo(() => createValidatedDemoData(scenario), [scenario]);
}
