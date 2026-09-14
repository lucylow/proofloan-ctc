import { createContext, useContext } from "react";
import type { MockDemoAction } from "./demoActions";
import type { MockDataset, MockScenario } from "./types";

export type MockAttestcoinValue = {
  enabled: true;
  presentationOnly: true;
  scenario: MockScenario;
  dataset: MockDataset;
  setScenario: (scenario: MockScenario) => void;
  reset: () => void;
  applyAction: (action: MockDemoAction) => void;
};

export const MockAttestcoinContext = createContext<MockAttestcoinValue | null>(null);

export function useMockAttestcoin() {
  const value = useContext(MockAttestcoinContext);
  if (!value) {
    throw new Error("useMockAttestcoin must be used within MockAttestcoinProvider");
  }
  return value;
}

export function useOptionalMockAttestcoin() {
  return useContext(MockAttestcoinContext);
}
