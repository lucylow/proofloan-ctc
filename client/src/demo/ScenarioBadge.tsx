import {
  Beaker,
} from "lucide-react";

import { useDemo } from "./DemoProvider";
import { MOCK_SCENARIO_LABELS } from "@/mock-attestcoin/constants";
import { isMockScenario } from "@/mock-attestcoin/scenarios";

const legacyLabels: Record<string, string> = {
  hero: "Hero demo",
  healthy: "Healthy account",
  "active-loan": "Active loan",
  review: "Manual review",
  "risk-warning": "Risk warning",
  empty: "Empty state",
  "error-recovery": "Recovery state",
};

export function ScenarioBadge() {
  const { scenario } = useDemo();
  const label = isMockScenario(scenario)
    ? MOCK_SCENARIO_LABELS[scenario]
    : legacyLabels[scenario] ?? scenario;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/10 bg-violet-400/[0.04] px-3 py-1.5 text-[10px] text-violet-300">
      <Beaker className="h-3 w-3" />
      {label}
    </div>
  );
}
