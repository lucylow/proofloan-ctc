import { DemoError } from "../errors";
import { listExtendedCases } from "./catalog";
import { materializeCase } from "./factory";

export function validateExtendedCatalog(): {
  total: number;
  duplicateIds: string[];
  missingFacts: string[];
  unlabelledFacts: string[];
} {
  const cases = listExtendedCases();
  const seen = new Set<string>();
  const duplicateIds: string[] = [];
  const missingFacts: string[] = [];
  const unlabelledFacts: string[] = [];
  for (const item of cases) {
    if (seen.has(item.id)) duplicateIds.push(item.id);
    seen.add(item.id);
    try {
      const snapshot = materializeCase(item, Date.UTC(2026, 0, 1));
      if (!snapshot.facts.length) missingFacts.push(item.id);
      if (snapshot.facts.some(fact => fact.evidenceMode !== "mock")) unlabelledFacts.push(item.id);
    } catch {
      missingFacts.push(item.id);
    }
  }
  return { total: cases.length, duplicateIds, missingFacts, unlabelledFacts };
}

export function assertExtendedCatalogValid(): void {
  const result = validateExtendedCatalog();
  if (result.duplicateIds.length) {
    throw new DemoError("CATALOG", `Duplicate extended demo IDs: ${result.duplicateIds.join(", ")}`);
  }
  if (result.missingFacts.length) {
    throw new DemoError("CATALOG", `Extended demo cases without facts: ${result.missingFacts.join(", ")}`);
  }
  if (result.unlabelledFacts.length) {
    throw new DemoError("CATALOG", `Extended demo cases without mock labels: ${result.unlabelledFacts.join(", ")}`);
  }
}
