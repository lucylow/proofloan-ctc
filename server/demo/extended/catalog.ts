import { DemoError } from "../errors";
import type { ExtendedScenarioCase } from "./types";
import { ALL_EXTENDED_CASES } from "./cases";

export function listExtendedCases(): ExtendedScenarioCase[] {
  if (!Array.isArray(ALL_EXTENDED_CASES) || ALL_EXTENDED_CASES.length === 0) {
    throw new DemoError("CATALOG", "The extended demo catalog is empty.");
  }
  return [...ALL_EXTENDED_CASES];
}

export function getExtendedCase(id: string): ExtendedScenarioCase {
  const normalized = id.trim();
  if (!normalized) throw new DemoError("VALIDATION", "Extended demo case id is required.");
  const found = ALL_EXTENDED_CASES.find(item => item.id === normalized);
  if (!found) throw new DemoError("VALIDATION", `Unknown extended demo case: ${normalized}`);
  return found;
}

export function searchExtendedCases(query: string): ExtendedScenarioCase[] {
  const normalized = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (normalized.length > 200) {
    throw new DemoError("VALIDATION", "Extended demo search query is too long.");
  }
  if (!normalized) return listExtendedCases();
  return ALL_EXTENDED_CASES.filter(item =>
    [item.id, item.label, item.kind, item.description, ...item.tags].join(" ").toLowerCase().includes(normalized),
  );
}
