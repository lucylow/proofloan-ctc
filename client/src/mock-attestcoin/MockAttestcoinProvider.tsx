import { ReactNode, useCallback, useMemo, useState } from "react";
import { MOCK_SEED, type MockScenario } from "./constants";
import { createMockDataset } from "./createMockDataset";
import { applyMockDemoAction, type MockDemoAction } from "./demoActions";
import { MockAttestcoinContext, type MockAttestcoinValue } from "./hooks";
import { isMockScenario, mapLegacyDemoScenario } from "./scenarios";
import { sanitizeMockDataset } from "./sanitizers";
import { resolveStorage, readJson, writeJson } from "@/hardening/safeStorage";

const STORAGE_KEY = "proofloan.mock-attestcoin.scenario";

function readStoredScenario(fallback: MockScenario): MockScenario {
  const result = readJson<unknown>(resolveStorage("session"), STORAGE_KEY, fallback);
  if (!result.ok || typeof result.value !== "string") return fallback;
  return mapLegacyDemoScenario(result.value);
}

export function isMockAttestcoinEnabled() {
  return import.meta.env.VITE_DEMO_MODE !== "false";
}

export function MockAttestcoinProvider({
  children,
  initialScenario = "hero",
}: {
  children: ReactNode;
  initialScenario?: MockScenario;
}) {
  const [scenario, setScenarioState] = useState<MockScenario>(() => {
    const stored = readStoredScenario(initialScenario);
    return isMockScenario(stored) ? stored : initialScenario;
  });

  const dataset = useMemo(
    () => sanitizeMockDataset(createMockDataset(scenario, MOCK_SEED)),
    [scenario],
  );

  const setScenario = useCallback((next: MockScenario) => {
    const safe = isMockScenario(next) ? next : "hero";
    setScenarioState(safe);
    writeJson(resolveStorage("session"), STORAGE_KEY, safe);
  }, []);

  const reset = useCallback(() => setScenario("hero"), [setScenario]);

  const applyAction = useCallback((action: MockDemoAction) => {
    setScenarioState(current => {
      const next = applyMockDemoAction(createMockDataset(current, MOCK_SEED), action);
      writeJson(resolveStorage("session"), STORAGE_KEY, next.scenario);
      return next.scenario;
    });
  }, []);

  const value = useMemo<MockAttestcoinValue>(() => ({
    enabled: true,
    presentationOnly: true,
    scenario,
    dataset,
    setScenario,
    reset,
    applyAction,
  }), [applyAction, dataset, reset, scenario, setScenario]);

  return (
    <MockAttestcoinContext.Provider value={value}>
      {children}
    </MockAttestcoinContext.Provider>
  );
}
