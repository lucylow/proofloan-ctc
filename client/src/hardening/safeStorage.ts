import { normalizeAppError } from "./appError";
import type { Result } from "./types";

export type StorageArea = Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;

export function resolveStorage(kind: "local" | "session"): StorageArea | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function readJson<T>(storage: StorageArea | undefined, key: string, fallback: T): Result<T> {
  if (!storage) {
    return {
      ok: false,
      error: normalizeAppError(new Error("Storage unavailable"), {
        source: "storage",
      }),
    };
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) return { ok: true, value: fallback };
    return { ok: true, value: JSON.parse(raw) as T };
  } catch (error) {
    return {
      ok: false,
      error: normalizeAppError(error, { source: "storage" }),
    };
  }
}

export function writeJson<T>(storage: StorageArea | undefined, key: string, value: T): Result<void> {
  if (!storage) {
    return {
      ok: false,
      error: normalizeAppError(new Error("Storage unavailable"), {
        source: "storage",
      }),
    };
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: normalizeAppError(error, { source: "storage" }),
    };
  }
}

export function removeSafe(storage: StorageArea | undefined, key: string): Result<void> {
  if (!storage) {
    return {
      ok: false,
      error: normalizeAppError(new Error("Storage unavailable"), {
        source: "storage",
      }),
    };
  }

  try {
    storage.removeItem(key);
    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: normalizeAppError(error, { source: "storage" }),
    };
  }
}
