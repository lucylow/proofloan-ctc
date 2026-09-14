import { normalizeAppError } from "./appError";
import type { Result } from "./types";

export function parseJsonSafe<T>(input: string, fallback?: T): Result<T> {
  try {
    return { ok: true, value: JSON.parse(input) as T };
  } catch (error) {
    const normalized = normalizeAppError(error, { source: "validation" });
    if (fallback !== undefined) return { ok: true, value: fallback };
    return { ok: false, error: normalized };
  }
}

export function stringifyJsonSafe(value: unknown): Result<string> {
  try {
    return { ok: true, value: JSON.stringify(value) };
  } catch (error) {
    return { ok: false, error: normalizeAppError(error, { source: "validation" }) };
  }
}
