import { resolveStorage, writeJson, readJson } from "./safeStorage";

export type TelemetryEvent = {
  id: string;
  name: string;
  timestamp: number;
  metadata?: Record<string, string | number | boolean | null>;
};

const KEY = "proofloan.telemetry.buffer";
const MAX_EVENTS = 50;

export function pushTelemetry(event: TelemetryEvent) {
  const storage = resolveStorage("session");
  const existing = readJson<TelemetryEvent[]>(storage, KEY, []);
  if (!existing.ok) return;
  writeJson(storage, KEY, [...existing.value, event].slice(-MAX_EVENTS));
}

export function readTelemetry(): TelemetryEvent[] {
  const result = readJson<TelemetryEvent[]>(resolveStorage("session"), KEY, []);
  return result.ok ? result.value : [];
}

export function clearTelemetry() {
  try {
    resolveStorage("session")?.removeItem(KEY);
  } catch {
    // best effort only
  }
}
