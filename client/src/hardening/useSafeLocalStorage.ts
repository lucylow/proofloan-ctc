import { useCallback, useState } from "react";
import { readJson, resolveStorage, writeJson } from "./safeStorage";

export function useSafeLocalStorage<T>(key: string, initialValue: T) {
  const storage = resolveStorage("local");

  const [value, setValue] = useState<T>(() => {
    const result = readJson<T>(storage, key, initialValue);
    return result.ok ? result.value : initialValue;
  });

  const update = useCallback((next: T | ((previous: T) => T)) => {
    setValue(previous => {
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
      writeJson(storage, key, resolved);
      return resolved;
    });
  }, [key, storage]);

  return [value, update] as const;
}
