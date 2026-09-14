import { AiError } from "../errors";

export function enforceEvidenceMode(mode: "verified" | "mock", allowMock: boolean) {
  if (mode === "mock" && !allowMock) {
    throw new AiError("POLICY", "Mock blockchain evidence is disabled");
  }
  return mode;
}
