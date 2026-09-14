import type { DemoDataSet, DemoScenario } from "../types";
import { createDemoData } from "../createDemoData";
import { validateDemoData } from "./demoSchema";

export function createValidatedDemoData(scenario: DemoScenario): DemoDataSet {
  const candidate = createDemoData(scenario);
  const validated = validateDemoData(candidate);
  return validated.ok ? validated.value : createDemoData("hero");
}
