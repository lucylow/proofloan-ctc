import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { DemoDataSet, DemoScenario } from "./types";
import { createValidatedDemoData } from "./validation/demoRecovery";
import { validateDemoData } from "./validation/demoSchema";
import { inspectDemoReferences } from "./validation/referenceIntegrity";
import { resolveStorage, readJson, writeJson } from "@/hardening/safeStorage";
import { logHardeningError } from "@/hardening/logger";
import { structuredCloneSafe } from "@/hardening/structuredCloneSafe";
import { useOptionalMockAttestcoin } from "@/mock-attestcoin/hooks";
import { mapLegacyDemoScenario } from "@/mock-attestcoin/scenarios";
import { toDemoDataset } from "@/mock-attestcoin/toDemo";

const STORAGE_KEY = "proofloan.demo.scenario";
const scenarios: DemoScenario[] = [
  "hero",
  "healthy",
  "active-loan",
  "review",
  "risk-warning",
  "empty",
  "error-recovery",
  "cross-chain-wealth",
  "strong-repayment",
  "fresh-evidence",
  "aging-evidence",
  "proof-delay",
  "proof-rejected",
  "partial-attestation",
  "multi-chain",
  "new-wallet",
  "high-risk",
  "recovery",
  "judge",
];

type DemoValue = {
  enabled: boolean;
  scenario: DemoScenario;
  data: DemoDataSet;
  setScenario: (scenario: DemoScenario) => void;
  reset: () => void;
};

const Context = createContext<DemoValue | null>(null);

function readScenario(): DemoScenario {
  const result = readJson<unknown>(resolveStorage("session"), STORAGE_KEY, "hero");
  if (!result.ok) return "hero";
  return typeof result.value === "string" && scenarios.includes(result.value as DemoScenario)
    ? result.value as DemoScenario
    : "hero";
}

function fallbackDemoScenario(scenario: DemoScenario): DemoScenario {
  if (
    scenario === "hero" ||
    scenario === "healthy" ||
    scenario === "active-loan" ||
    scenario === "review" ||
    scenario === "risk-warning" ||
    scenario === "empty" ||
    scenario === "error-recovery"
  ) {
    return scenario;
  }
  if (scenario === "recovery") return "error-recovery";
  if (scenario === "high-risk") return "risk-warning";
  if (scenario === "aging-evidence") return "review";
  if (scenario === "strong-repayment") return "active-loan";
  return "hero";
}

export function HardenedDemoProvider({ children }: { children: ReactNode }) {
  const mock = useOptionalMockAttestcoin();
  const [scenario, setScenarioState] = useState<DemoScenario>(readScenario);

  const data = useMemo(() => {
    try {
      if (mock) {
        const mapped = toDemoDataset(mock.dataset);
        const validated = validateDemoData(mapped);
        const value = validated.ok ? mapped : createValidatedDemoData("hero");
        const issues = inspectDemoReferences(value);
        if (issues.length) {
          logHardeningError("demo", new Error("Demo reference integrity warnings"), { issueCount: issues.length });
        }
        return value;
      }

      const value = createValidatedDemoData(fallbackDemoScenario(scenario));
      const issues = inspectDemoReferences(value);
      if (issues.length) {
        logHardeningError("demo", new Error("Demo reference integrity warnings"), { issueCount: issues.length });
      }
      return value;
    } catch (error) {
      logHardeningError("demo", error, { scenario: mock?.scenario ?? scenario });
      return createValidatedDemoData("hero");
    }
  }, [mock, scenario]);

  const setScenario = useCallback((next: DemoScenario) => {
    const safeScenario = scenarios.includes(next) ? next : "hero";
    if (mock) {
      mock.setScenario(mapLegacyDemoScenario(safeScenario));
    }
    setScenarioState(mapLegacyDemoScenario(safeScenario));
    writeJson(resolveStorage("session"), STORAGE_KEY, mapLegacyDemoScenario(safeScenario));
  }, [mock]);

  const reset = useCallback(() => setScenario("hero"), [setScenario]);

  const value = useMemo<DemoValue>(() => ({
    enabled: true,
    scenario: mock ? mock.scenario : scenario,
    data: structuredCloneSafe(data),
    setScenario,
    reset,
  }), [data, mock, reset, scenario, setScenario]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useHardenedDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("useHardenedDemo must be used within HardenedDemoProvider");
  return value;
}

export const useDemo = useHardenedDemo;
